import React from 'react';
import type { Metadata } from 'next';
import './tailwind.css';
import './fonts/inter.css';

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
        {children}
      </body>
    </html>
  )
}
