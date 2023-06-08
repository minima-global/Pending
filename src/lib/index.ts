import { MDSPendingResponse } from '../types';

export function getPendingActions(): Promise<MDSPendingResponse> {
  return new Promise((resolve, reject) => {
    (window as any).MDS.cmd('mds action:pending', function (response: any) {
      if (response.status) {
        return resolve(response.response);
      }

      return reject();
    });
  });
}

export function acceptAction(uid: string): Promise<any> {
  return new Promise((resolve, reject) => {
    (window as any).MDS.cmd(`mds action:accept uid:${uid}`, function (response: any) {
      if (response.status) {
        return resolve(response);
      }

      return reject();
    });
  });
}

export function declineAction(uid: string): Promise<any> {
  return new Promise((resolve, reject) => {
    (window as any).MDS.cmd(`mds action:deny uid:${uid}`, function (response: any) {
      if (response.status) {
        return resolve(response);
      }

      return reject();
    });
  });
}

export function isWriteMode(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    (window as any).MDS.cmd(`checkmode`, function (response: any) {
      if (response.status) {
        return resolve(response.response.mode === 'WRITE');
      }

      return reject();
    });
  });
}
