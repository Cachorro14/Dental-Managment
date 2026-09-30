<?php

namespace App\Http\Controllers\Admin;

use App\Core\Settings\ClinicSettings;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBrandingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandingController extends Controller
{
    public function __construct(private ClinicSettings $settings) {}

    public function edit(): Response
    {
        return Inertia::render('Admin/Branding/Edit', ['branding' => $this->settings->branding()]);
    }

    public function update(UpdateBrandingRequest $request): RedirectResponse
    {
        $this->settings->set('branding.name', $request->string('name')->trim()->toString());
        $this->settings->set('branding.variant', $request->string('variant')->toString());
        $this->settings->set('branding.theme', $request->string('theme')->toString());

        foreach (['logo', 'icon'] as $asset) {
            if (! $request->hasFile($asset)) {
                continue;
            }

            $previous = $this->settings->get("branding.{$asset}");
            $path = $request->file($asset)->store('branding', 'public');
            $this->settings->set("branding.{$asset}", $path);

            if ($previous !== null) {
                Storage::disk('public')->delete($previous);
            }
        }

        return back()->with('success', 'Branding updated.');
    }
}
