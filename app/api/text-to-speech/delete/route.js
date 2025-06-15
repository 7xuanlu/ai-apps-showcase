import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');
  if (!filePath) {
    return NextResponse.json({ msg: 'No file path provided' }, { status: 400 });
  }
  const absPath = path.join(process.cwd(), 'public', filePath);
  try {
    await fs.access(absPath);
    await fs.unlink(absPath);
    return NextResponse.json({ msg: 'File deleted', path: filePath });
  } catch (err) {
    return NextResponse.json({ msg: 'Failed to delete the file', path: filePath }, { status: 500 });
  }
} 