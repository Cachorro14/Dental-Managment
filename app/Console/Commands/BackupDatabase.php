<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;

#[Signature('app:backup-database {--keep=14 : Días de respaldos a conservar}')]
#[Description('Exporta la base de datos MySQL a un archivo comprimido y elimina respaldos antiguos.')]
class BackupDatabase extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $connection = config('database.connections.'.config('database.default'));

        if (($connection['driver'] ?? null) !== 'mysql') {
            $this->error('El respaldo solo está disponible para conexiones MySQL.');

            return self::FAILURE;
        }

        $directory = storage_path('app/private/backups');
        File::ensureDirectoryExists($directory);

        $sqlPath = $directory.'/'.$connection['database'].'-'.now()->format('Y-m-d_His').'.sql';

        // The password goes through MYSQL_PWD so it never shows up in the server's process list.
        $result = Process::env(['MYSQL_PWD' => (string) $connection['password']])
            ->timeout(600)
            ->run([
                $connection['dump_binary'],
                '--host='.$connection['host'],
                '--port='.$connection['port'],
                '--user='.$connection['username'],
                '--single-transaction',
                '--routines',
                '--no-tablespaces',
                '--result-file='.$sqlPath,
                $connection['database'],
            ]);

        if ($result->failed()) {
            File::delete($sqlPath);
            $this->error('Falló el respaldo: '.trim($result->errorOutput()));

            return self::FAILURE;
        }

        $gzipPath = $sqlPath.'.gz';
        $this->compress($sqlPath, $gzipPath);
        File::delete($sqlPath);

        $removed = $this->pruneOlderThan($directory, (int) $this->option('keep'));

        $this->info('Respaldo creado: '.basename($gzipPath)." ({$removed} respaldos antiguos eliminados).");

        return self::SUCCESS;
    }

    private function compress(string $source, string $destination): void
    {
        $input = fopen($source, 'rb');
        $output = gzopen($destination, 'wb6');

        while (! feof($input)) {
            gzwrite($output, fread($input, 1024 * 512));
        }

        fclose($input);
        gzclose($output);
    }

    private function pruneOlderThan(string $directory, int $days): int
    {
        $threshold = now()->subDays($days)->getTimestamp();
        $removed = 0;

        foreach (File::glob($directory.'/*.sql.gz') as $file) {
            if (File::lastModified($file) < $threshold) {
                File::delete($file);
                $removed++;
            }
        }

        return $removed;
    }
}
