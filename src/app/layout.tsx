import React from 'react';
import type { Metadata } from 'next';
import '@/app/tailwind.css';
import '@/app/styles.css';
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
      <body className="bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  )
}
