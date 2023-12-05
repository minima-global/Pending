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
        return resolve(response.response.writemode);
      }

      return reject();
    });
  });
}

export function isLocked(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    (window as any).MDS.cmd(`status`, function (response: any) {
      if (response.status) {
        return resolve(response.response.locked);
      }

      return reject();
    });
  });
}

export function set(key: string, value: string) {
  return new Promise((resolve, reject) => {
    (window as any).MDS.keypair.set(key, value, function (response: any) {
      if (response.status) {
        return resolve(response.response);
      }

      return reject();
    });
  });
}

export function get(key: string) {
  return new Promise((resolve) => {
    (window as any).MDS.keypair.get(key, function (response: any) {
      if (response.status) {
        return resolve(response.value);
      }

      return resolve('0');
    });
  });
}

export function lock(password: string): Promise<boolean|void> {
  return new Promise((resolve) => {
    (window as any).MDS.cmd(`vault action:passwordlock password:${password}`, function (response: any) {
      if (response.status) {
        return resolve(response.status);
      }

      return resolve();
    });
  });
}

export function unlock(password: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    (window as any).MDS.cmd(`vault action:passwordunlock password:${password}`, function (response: any) {
      if (response.status) {
        return resolve(response.status);
      }

      return reject(response.error);
    });
  });
}
