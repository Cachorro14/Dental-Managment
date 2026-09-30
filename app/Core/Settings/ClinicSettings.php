<?php

namespace App\Core\Settings;

use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

final class ClinicSettings
{
    /**
     * @return array<string, string|null>
     */
    public function defaults(): array
    {
        return [
            'clinic.name' => (string) config('app.name', 'Dental Clinic'),
            'clinic.logo' => null,
            'clinic.timezone' => (string) config('app.timezone', 'UTC'),
            'clinic.locale' => (string) config('app.locale', 'en'),
            'clinic.currency' => 'USD',
            'branding.name' => (string) config('app.name', 'Dental Clinic'),
            'branding.logo' => null,
            'branding.icon' => null,
            'branding.variant' => 'clinical',
            'branding.theme' => 'light',
        ];
    }

    /**
     * @return array<string, ?string>
     */
    public function all(): array
    {
        return array_replace(
            $this->defaults(),
            ClinicSetting::query()->pluck('value', 'key')->all(),
        );
    }

    public function get(string $key): ?string
    {
        if (! array_key_exists($key, $this->defaults())) {
            throw new InvalidArgumentException("Unknown clinic setting [{$key}].");
        }

        return $this->all()[$key];
    }

    public function set(string $key, ?string $value): ClinicSetting
    {
        if (! array_key_exists($key, $this->defaults())) {
            throw new InvalidArgumentException("Unknown clinic setting [{$key}].");
        }

        return ClinicSetting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value],
        );
    }

    /**
     * @return array{name: string, logoUrl: ?string, iconUrl: ?string, variant: string, theme: string}
     */
    public function branding(): array
    {
        $settings = $this->all();

        return [
            'name' => $settings['branding.name'] ?: $settings['clinic.name'],
            'logoUrl' => $this->assetUrl($settings['branding.logo'] ?: $settings['clinic.logo']),
            'iconUrl' => $this->assetUrl($settings['branding.icon']),
            'variant' => $settings['branding.variant'] ?: 'clinical',
            'theme' => $settings['branding.theme'] ?: 'light',
        ];
    }

    private function assetUrl(?string $path): ?string
    {
        return $path === null ? null : Storage::disk('public')->url($path);
    }
}
