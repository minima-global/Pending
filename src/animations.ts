export const drawerAnimation = {
  from: {
    y: '20%',
    scale: 1,
    opacity: 0.8,
  },
  enter: {
    y: '0%',
    scale: 1,
    opacity: 1,
  },
  leave: {
    y: '80%',
    scale: 1,
    opacity: 0,
  },
  config: {
    duration: 100,
  },
};

export const modalAnimation: any = {
  from: {
    scale: 0.8,
    opacity: 0.8,
  },
  enter: {
    scale: 1,
    opacity: 1,
  },
  leave: {
    scale: 0.4,
    opacity: 0,
  },
  config: {
    duration: 100,
  },
};
