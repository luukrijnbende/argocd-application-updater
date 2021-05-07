import colorette from "colorette";

enum LogLevel {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warning = 3,
    Error = 4,
}

export class Logger {
    private static logLevel = LogLevel.Info;
    
    /**
     * Log a debug message.
     * @param {string} tag - The tag to add to the log message. 
     * @param {any} message - The mssage to log.
     */
    public static debug(tag: string, message: any): void {
        Logger.log(LogLevel.Debug, tag, message);
    }

    /**
     * Log an info message.
     * @param {string} tag - The tag to add to the log message. 
     * @param {any} message - The mssage to log.
     */
    public static info(tag: string, message: any): void {
        Logger.log(LogLevel.Info, tag, message);
    }

    /**
     * Log a warning message.
     * @param {string} tag - The tag to add to the log message. 
     * @param {any} message - The mssage to log.
     */
    public static warning(tag: string, message: any): void {
        Logger.log(LogLevel.Warning, tag, message);
    }

    /**
     * Log an error message.
     * @param {string} tag - The tag to add to the log message. 
     * @param {any} message - The mssage to log.
     */
    public static error(tag: string, message: any): void {
        Logger.log(LogLevel.Error, tag, message);
    }

    /**
     * Log a message to the console.
     * @param {LogLevel} level - The level to log. 
     * @param {string} tag - The tag to add to the log message.
     * @param {any} message - The message to log.
     */
     private static log(level: LogLevel, tag: string, message: any): void {
        if (level < Logger.logLevel) {
            return;
        }

        const parts = {
            message,
            level: `[${LogLevel[level].toLowerCase()}]`,
            timestamp: colorette.cyan(`[${Logger.getTimestamp()}]`),
            tag: colorette.green(`[${tag}]`),
        }

        // Color the log levels.
        switch (level) {
            case LogLevel.Trace:
            case LogLevel.Debug:
                parts.level = colorette.gray(parts.level);
                break;
            case LogLevel.Warning:
                parts.level = colorette.yellow(parts.level);
                break;
            case LogLevel.Error:
                parts.level = colorette.red(parts.level);
                break;
        }

        console.log(`${parts.level}${parts.timestamp}${parts.tag} - ${parts.message}`);
    }

    /**
     * Get the current timestamp formatted as HH:mm:ss.
     * @returns {string} - The formatted timestamp.
     */
    private static getTimestamp(): string {
        const date = new Date();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`
    }
}
