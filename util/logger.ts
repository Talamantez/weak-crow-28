// logger.ts

// Usage example:
// Logger.setLogLevel('DEBUG');
// Logger.debug('This is a debug message', { someData: 'value' });
// Logger.info('This is an info message');
// Logger.warn('This is a warning');
// Logger.error('This is an error', new Error('Something went wrong'));

export class Logger {
    private static logLevels = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
    };

    private static currentLogLevel = Logger.logLevels.INFO;

    private static formatMessage(
        level: string,
        message: string,
        ...args: any[]
    ): string {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg) : arg
        ).join(" ");
        return `${timestamp} [${level}] ${message} ${formattedArgs}`.trim();
    }

    private static log(level: string, message: string, ...args: any[]): void {
        if (Logger.logLevels[level] >= Logger.currentLogLevel) {
            const formattedMessage = Logger.formatMessage(
                level,
                message,
                ...args,
            );
            console.log(formattedMessage);

            // You can add additional logging destinations here, like file logging or external services
        }
    }

    public static setLogLevel(level: keyof typeof Logger.logLevels): void {
        Logger.currentLogLevel = Logger.logLevels[level];
    }

    public static debug(message: string, ...args: any[]): void {
        Logger.log("DEBUG", message, ...args);
    }

    public static info(message: string, ...args: any[]): void {
        Logger.log("INFO", message, ...args);
    }

    public static warn(message: string, ...args: any[]): void {
        Logger.log("WARN", message, ...args);
    }

    public static error(message: string, ...args: any[]): void {
        Logger.log("ERROR", message, ...args);
    }
}
