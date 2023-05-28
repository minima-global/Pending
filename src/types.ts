export type MDSPendingResponse = {
  pending: {
    uid: string;
    command: string;
    minidapp: {
      uid: string;
      conf: {
        name: string;
        permission: string;
        version: string;
        icon: string;
        description: string;
        browser: string;
      };
    };
  }[];
};
