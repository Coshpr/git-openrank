'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CountryData {
  id: string;
  name: string;
  flag_code: string;
  count: number;
  delta: number;
  deltaRatio: number;
}

const CountryRanking = ({ data }: { data: CountryData[] }) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Country</TableHead>
            <TableHead className="w-30  text-center">Developers</TableHead>
            <TableHead className="w-30  text-center">Delta</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div className="max-h-80 overflow-y-auto">
        <Table>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={`country-${item.id}-${index}`}>
                <TableCell className="font-medium w-12">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="mr-2">{item.flag_code}</span>
                    <span>{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="w-30  text-center">
                  {item.count.toLocaleString()}
                </TableCell>
                <TableCell className="w-30  text-center">
                  <span
                    className={
                      item.delta >= 0 ? 'text-green-500' : 'text-red-500'
                    }
                  >
                    {item.delta >= 0 ? '▲' : '▼'} ({item.deltaRatio.toFixed(2)}
                    %)
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CountryRanking;
