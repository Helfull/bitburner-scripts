import { NS } from '@ns';

export async function main(ns: NS) {
  const save = await getSave();
  const finishExploit: string[] = [];
  const playerSave = JSON.parse(save.data.PlayerSave);
  ns.print('Exploits: ' + playerSave.data.exploits.join(', '));

  const doc = eval('document');

  if (!playerSave.data.exploits.includes('exploit')) {
    ns.print('Executing exploit exploit');
    // @ts-expect-error bypass hidden function
    ns.exploit();
  }

  if (!playerSave.data.exploits.includes('YoureNotMeantToAccessThis')) {
    ns.print('Executing Bypass YoureNotMeantToAccessThis');
    ns.exec('exploits/devmenu.js', 'home', 1);
  }

  if (!playerSave.data.exploits.includes('Bypass')) {
    ns.print('Executing Bypass exploit');
    ns.exec('exploits/bypass.js', 'home', 1);
  }

  if (!playerSave.data.exploits.includes('INeedARainbow')) {
    ns.print('Executing INeedARainbow exploit');
    // @ts-expect-error bypass hidden function
    ns.rainbow('noodles');
  }

  if (!playerSave.data.exploits.includes('Unclickable')) {
    ns.print('Executing Unclickable exploit');
    finishExploit.push('Unclickable');
    const uc = doc.getElementById('unclickable')
    uc.style.display = 'block';
    uc.style.visibility = 'visible';
    uc.style.position = 'absolute';
    uc.style.top = 'inherit';
    uc.style.bottom = '50px';
    uc.style.left = '150px';
    uc.style.background = 'white';
    uc.style.width = '500px';
    uc.style.cursor = 'pointer';

    uc.onClick = () => {
      uc.style.display = 'none';
      uc.style.visibility = 'hidden';
      finishExploit.splice(finishExploit.indexOf('Unclickable'), 1);
    }
  }

  if (!playerSave.data.exploits.includes('EditSaveFile') ) {
    ns.print('Executing EditSaveFile exploit');
    playerSave.data.exploits.push('EditSaveFile');
    ns.print('NewExploits: ' + playerSave.data.exploits.join(', '));
    save.data.PlayerSave = JSON.stringify(playerSave);
    await setSave(save);
  }

  if (!playerSave.data.exploits.includes('PrototypeTampering')) {
    ns.print('Executing PrototypeTampering exploit');
    finishExploit.push('PrototypeTampering');
    // @ts-expect-error exploit PrototypeTampering
    Number.prototype.orgToExponential = Number.prototype.toExponential;
    Number.prototype.toExponential = function() {
      finishExploit.splice(finishExploit.indexOf('PrototypeTampering'), 1);
      return '1';
    }
  }

  if (!playerSave.data.exploits.includes('TimeCompression')) {
    ns.print('Executing TimeCompression exploit');
    finishExploit.push('TimeCompression');
    performance.now = () => {
      finishExploit.splice(finishExploit.indexOf('TimeCompression'), 1);
      return -9e15;
    };
  }

  while(finishExploit.length > 0) {
    ns.print('Waiting for exploits to finish: ' + finishExploit.join(', '))
    await ns.asleep(1000);
  }
}

function setSave(save: any): Promise<void> {
  return new Promise((resolve, reject) => {
    getDB().then((db) => {
      const r = db.put(btoa(JSON.stringify(save)), 'save');
      r.onsuccess = () => {
        resolve();
      }

      r.onerror = () => {
        reject(r.error);
      }
    });
  });
}

function getSave(): Promise<any> {
  return new Promise((resolve, reject) => {
    getDB().then((db) => {
      const r = db.get('save');
      r.onsuccess = (event) => {
        resolve(JSON.parse(atob(r.result)));
      }

      r.onerror = () => {
        reject(r.error);
      }
    });
  });
}

function getDB(): Promise<IDBObjectStore> {
  return new Promise((resolve, reject) => {
    const res = indexedDB.open('bitburnerSave')
    res.onupgradeneeded = () => {
      reject('onupgradeneeded');
    }

    res.onsuccess = () => {
      const transaction = res.result.transaction(['savestring'], 'readwrite');
      resolve(transaction.objectStore('savestring'));
    }

    res.onerror = () => {
      reject(res.error);
    }
  });
}
