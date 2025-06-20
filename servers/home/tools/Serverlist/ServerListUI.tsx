import React, {useContext, useEffect, useState} from 'react';
import { COLUMNS, FILTERS, SORTS, ServerListArgs, serverList } from './Serverlist';
import { CollapsableMultiSelect } from '@lib/ui/MultiSelect';
import { Collapsable } from '@lib/ui/Collapsable';
import { Checkbox } from '@lib/ui/Checkbox';
import { ServerList } from './ui/Serverlist';
import { NetscriptContext } from '@lib/MountingPoint';

function storeSettings(settings: ServerListArgs) {
  localStorage.setItem('serverlist-settings', JSON.stringify(settings));
}

function loadSettings(): ServerListArgs {
  const settings = localStorage.getItem('serverlist-settings');
  if (settings === null) return {
    columns: [
      'index',
      'name',
      'money',
      'secLevel',
      'rootAccess',
      'protoStatus',
      'prepStatus',
      'weight',
    ],
    sort: ['weight'],
    filter: ['money'],
  };
  return JSON.parse(settings);
}

function useSettings(): [
  ServerListArgs,
  (columns: ServerListArgs['columns']) => void,
  (sort: ServerListArgs['sort']) => void,
  (filter: ServerListArgs['filter']) => void,
  (newSettings: ServerListArgs) => void,
] {
  const [settings, setSettings] = useState(loadSettings());
  const setSettingsAndStore = (newSettings: ServerListArgs) => {
    storeSettings(newSettings);
    setSettings(newSettings);
  };
  return [
    settings,
    (columns: ServerListArgs['columns']) => {
      setSettingsAndStore({...settings, columns});
    },
    (sort: ServerListArgs['sort']) => {
      setSettingsAndStore({...settings, sort});
    },
    (filter: ServerListArgs['filter']) => {
      setSettingsAndStore({...settings, filter});
    },
    setSettingsAndStore,
  ];
}

export function ServerlistUI() {
  const ns: NS = useContext(NetscriptContext);

  const [debug, setDebug] = useState(false);
  const [settings, setSelectedColumns, setSelectedSorts, setSelectedFilters, setSettings] = useSettings();

  const updateServerlist = () => {
    return serverList(ns, settings)
  };

  const [serverListState, setServerlistState] = useState(() => updateServerlist());

  const [searchValue, setSearchValue] = useState('');
  const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setSettings({...settings, servers: e.target.value.split(' ')});
  };
  useEffect(() => {
    const intervalHandle = setInterval(() => {
      setServerlistState(() => updateServerlist());
    }, 100);

    return () => clearInterval(intervalHandle);
  }, [settings]);

  const styles = ns.ui.getStyles();
  const theme = ns.ui.getTheme();

  return <div id="serverlist-app" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '100%',
  }}>
    <div style={{
      color: 'white',
      fontFamily: styles.fontFamily,
      padding: '8px',
      backgroundColor: theme.backgroundprimary,
      display: 'flex',
      gap: '8px',
      flexDirection: 'column',
    }}>
      <Collapsable title="Settings" style={{
        paddingTop: '8px',
        display: 'flex',
        gap: '8px',
        flexDirection: 'column',
      }}>
        <Checkbox name="DebugMode" label="Debug" isChecked={debug} onChange={(checked) => setDebug(checked)} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'row',
          gap: '16px',
        }}>
          <CollapsableMultiSelect title="Sort" options={SORTS} value={settings.sort} onselect={(v) => setSelectedSorts(v as ServerListArgs['sort'])} />
          <CollapsableMultiSelect title="Filter" options={FILTERS} value={settings.filter} onselect={(v) => setSelectedFilters(v as ServerListArgs['filter'])} />
          <CollapsableMultiSelect title="Columns" options={COLUMNS} value={settings.columns} onselect={(v) => setSelectedColumns(v as ServerListArgs['columns'])} />
        </div>
      </Collapsable>

      <input type="text" name="serverSearch" placeholder="Search" style={{
        padding: '8px',
        backgroundColor: theme.backgroundsecondary,
        color: 'white',
        fontFamily: styles.fontFamily,
        boxSizing: 'border-box',
        border: 'none',
        width: '100%',
        outline: 'none',
      }} onChange={searchHandler} value={searchValue}/>
    </div>

    <div style={{
      display: debug ? 'block' : 'none',
      backgroundColor: theme.backgroundsecondary,
    }}>
      {JSON.stringify(serverListState.args)}
    </div>

    {serverListState.rows.length === 0 && <div>Loading...</div>}
    {serverListState.rows.length > 0 && <ServerList serverListState={serverListState} />}
  </div>;
}
