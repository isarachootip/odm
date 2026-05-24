import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
    try {
        console.log('Starting database migration...');

        // Run prisma db push to sync schema
        const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss');

        console.log('Migration stdout:', stdout);
        if (stderr) console.log('Migration stderr:', stderr);

        return NextResponse.json({
            success: true,
            message: 'Database schema updated successfully',
            details: stdout
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            details: error.stderr || error.stdout
        }, { status: 500 });
    }
}
