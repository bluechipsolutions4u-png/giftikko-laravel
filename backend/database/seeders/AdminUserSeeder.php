<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        $admin = User::where('email', 'ajith@gmail.com')->first();

        if (!$admin) {
            User::create([
                'name' => 'Ajith',
                'email' => 'ajith@gmail.com',
                'password' => Hash::make('admin123'), // Strong password
                'role' => 'admin',
            ]);
        }
    }
}
