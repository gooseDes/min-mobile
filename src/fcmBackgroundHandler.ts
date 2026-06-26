let backgroundMessageHandler: ((remoteMessage: any) => Promise<void>) | null = null;

export const setActiveBackgroundHandler = (handler: (remoteMessage: any) => Promise<void>) => {
    backgroundMessageHandler = handler;
};

export const getBackgroundMessageHandler = () => backgroundMessageHandler;
