import React from 'react';
import type { Metadata } from 'next';
import '@/app/tailwind.css';
import '@/app/fonts/inter.css';
import Navbar from '@/components/nav';

export const metadata: Metadata = {
  title: {
    default: 'DabSudoku - Play Free Sudoku Online',
    template: '%s | DabSudoku',
  },
  description: 'Solve web sudoku puzzles on DabSudoku.',
  keywords: ['sudoku', 'dabsudoku', 'play sudoku', 'free sudoku'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
