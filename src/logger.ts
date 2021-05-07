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
    
    private static log(level: LogLevel, tag: string, message: any): void {
        if (level < Logger.logLevel) {
            return;
        }

        const parts = {
            message,
            level: `[${LogLevel[level].toLowerCase()}]`,
            tag: colorette.green(`[${tag}]`),
        }

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

        console.log(`${parts.level}${parts.tag} - ${parts.message}`);
    }

    public static debug(tag: string, message: any): void {
        Logger.log(LogLevel.Debug, tag, message);
    }

    public static info(tag: string, message: any): void {
        Logger.log(LogLevel.Info, tag, message);
    }

    public static warning(tag: string, message: any): void {
        Logger.log(LogLevel.Warning, tag, message);
    }

    public static error(tag: string, message: any): void {
        Logger.log(LogLevel.Error, tag, message);
    }
}
