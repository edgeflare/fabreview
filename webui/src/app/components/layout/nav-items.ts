import {environment} from '@env';
import {Entity} from '@app/interfaces';

export interface NavItem extends Entity {
  children?: Entity[];
}

const couchdbPath = `_utils/#database/${environment.chaincode.channelId}_${environment.chaincode.name}/_all_docs`;

export const NAV_ITEMS: NavItem[] = [
  {
    name: 'Explorer',
    icon: '/hyperledger-explorer.png',
    route: 'hyperledger-explorer',
    exturl: `https://explorer-${environment.domainSuffix}`,
  },
  {
    name: 'peer0org1',
    icon: '/couchdb.svg',
    route: 'peer0-org1-couchdb',
    exturl: `https://peer0org1-couchdb-${environment.domainSuffix}/${couchdbPath}`,
  },
  {
    name: 'peer1org1',
    icon: '/couchdb.svg',
    route: 'peer1-org1-couchdb',
    exturl: `https://peer1org1-couchdb-${environment.domainSuffix}/${couchdbPath}`,
  },
  {
    name: 'peer0org2',
    icon: '/couchdb.svg',
    route: 'peer0-org2-couchdb',
    exturl: `https://peer0org2-couchdb-${environment.domainSuffix}/${couchdbPath}`,
  },
  {
    name: 'peer1org2',
    icon: '/couchdb.svg',
    route: 'peer1-org2-couchdb',
    exturl: `https://peer1org2-couchdb-${environment.domainSuffix}/${couchdbPath}`,
  },
];
