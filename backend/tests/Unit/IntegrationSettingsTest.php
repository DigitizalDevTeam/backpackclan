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
            'tawkToId' => '5f1a2b3c4d5e6f7a8b9c0d1e/1a2b3c4d',
            'gtmId' => 'gtm-abc123',
        ]);

        $integrations = $all['integrations'];

        $this->assertTrue($integrations['whatsappWidget']);
        $this->assertSame('GTM-ABC123', $integrations['gtmId']);
        $this->assertSame('5f1a2b3c4d5e6f7a8b9c0d1e/1a2b3c4d', $integrations['tawkToId']);
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
