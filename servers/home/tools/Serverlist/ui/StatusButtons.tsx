import { BooleanField } from '@/servers/home/tools/Serverlist/ui/Serverlist';
import { RunWrapper } from '@lib/ui/RunWrapper';
import React from 'react';

export function ProtoStatus({server, value}: {server: string, value: boolean}) {
  return <RunWrapper script={{
    scriptName: 'proto-batch.js',
    args: [server],
    host: 'home'
  }}>
    <BooleanField value={value} />
  </RunWrapper>;
}

export function PrepStatus({server, value}: {server: string, value: boolean}) {
  return <RunWrapper script={{
    scriptName: 'prep.js',
    args: [server],
    host: 'home'
  }}>
    <BooleanField value={value} />
  </RunWrapper>;
}
