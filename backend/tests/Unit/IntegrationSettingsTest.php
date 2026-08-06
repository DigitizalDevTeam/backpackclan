<?php

namespace Tests\Unit;

use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class IntegrationSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_integration_settings_are_accepted(): void
    {
        $service = app(SettingsService::class);

        $all = $service->updateGroup('integrations', [
            'whatsappWidget' => true,
            'tawkToEnabled' => true,
            'tawkToId' => '633605c554f06e12d8979f6c/1ge5gd3ld',
            'gtmId' => 'gtm-abc123',
        ]);

        $integrations = $all['integrations'];

        $this->assertTrue($integrations['whatsappWidget']);
        $this->assertSame('GTM-ABC123', $integrations['gtmId']);
        $this->assertSame('633605c554f06e12d8979f6c/1ge5gd3ld', $integrations['tawkToId']);
    }

    public function test_tawk_embed_url_is_normalized(): void
    {
        $service = app(SettingsService::class);

        $all = $service->updateGroup('integrations', [
            'whatsappWidget' => false,
            'tawkToEnabled' => true,
            'tawkToId' => 'https://embed.tawk.to/633605c554f06e12d8979f6c/1ge5gd3ld',
            'gtmId' => '',
        ]);

        $this->assertSame('633605c554f06e12d8979f6c/1ge5gd3ld', $all['integrations']['tawkToId']);
    }

    public function test_invalid_gtm_id_is_rejected(): void
    {
        $this->expectException(ValidationException::class);

        app(SettingsService::class)->updateGroup('integrations', [
            'whatsappWidget' => false,
            'tawkToEnabled' => false,
            'tawkToId' => '',
            'gtmId' => 'UA-12345-1',
        ]);
    }

    public function test_tawk_id_required_when_enabled(): void
    {
        $this->expectException(ValidationException::class);

        app(SettingsService::class)->updateGroup('integrations', [
            'whatsappWidget' => false,
            'tawkToEnabled' => true,
            'tawkToId' => '',
            'gtmId' => '',
        ]);
    }
}
