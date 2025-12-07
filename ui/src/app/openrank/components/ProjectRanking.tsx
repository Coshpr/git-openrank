'use client';

import React from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProjectData {
  id: string;
  name: string;
  logo: string;
  openrank: number;
  delta: number;
  repo_count: number;
  participant_count: number;
  platform: string;
}

const ProjectRanking = ({ data }: { data: ProjectData[] }) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader className="sticky top-0  z-10">
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>China projects</TableHead>
            <TableHead className="w-30  text-center">OpenRank</TableHead>
            <TableHead className="w-30 text-center">Delta</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div className="max-h-80 overflow-y-auto">
        <Table>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={`project-${item.id}-${index}`}>
                <TableCell className="font-medium w-12">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {item.logo && (
                      <div className="relative w-4 h-4 mr-2 rounded-full overflow-hidden">
                        <Image
                          src={item.logo}
                          alt={item.name}
                          fill
                          sizes="16px"
                          className="object-contain"
                          unoptimized={true}
                        />
                      </div>
                    )}
                    <span>{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="w-30  text-center">
                  {item.openrank.toFixed(2)}
                </TableCell>
                <TableCell className="w-30  text-center">
                  <span
                    className={
                      item.delta >= 0 ? 'text-green-500' : 'text-red-500'
                    }
                  >
                    {item.delta >= 0 ? '▲' : '▼'}
                    {Math.abs(item.delta).toFixed(2)}
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

export default ProjectRanking;
