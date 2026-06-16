<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\FileEncryptionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;

class GenerateUserEncryptionKeys extends Command
{
    protected $signature = 'ecvaultz:generate-encryption-keys';
    protected $description = 'Generate encryption keys for existing users who do not have one';

    public function handle(FileEncryptionService $encryption): int
    {
        $users = User::whereNull('encryption_key')->orWhere('encryption_key', '')->get();

        $count = 0;
        foreach ($users as $user) {
            $rawKey = $encryption->generateUserKey();
            $user->encryption_key = Crypt::encryptString($rawKey);
            $user->save();
            $count++;
        }

        $this->info("Generated encryption keys for {$count} user(s).");
        return Command::SUCCESS;
    }
}
