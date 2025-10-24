

class Logger {
    static ERROR_PREFIX = '[ERROR]';
    static ERROR_BG_COLOR = 'tomato';
    static WARNING_PREFIX = '[WARNING]';
    static WARNING_BG_COLOR = '#a47129ff';
    static SUCCESS_PREFIX = '[SUCCESS]';
    static SUCCESS_BG_COLOR = '#629721';
    static INFO_PREFIX = '[INFO]';
    static INFO_BG_COLOR = '#1366bfff';


    /**
     * Logs a message with a prefix and location information.
     *
     * @todo Implement logging to a file.
     * @param {string} message Message to be logged.
     * @param {string|null} prefix Prefix to be used for the log message. Can be one of 'error', 'warning', 'success', or 'info'. Default: `info`.
     * @returns {void}
     */
    static log(message, prefix = 'error') {
        // get message origin.
        const stack = new Error().stack;
        const callerLine = stack.split('\n')[2].trim() ?? '[unknown]';
        const match = callerLine.match(/\((.*):(\d+):(\d+)\)$/) || callerLine.match(/at (.*):(\d+):(\d+)/);

        let location = 'unknown';
        let bgColor = this.INFO_BG_COLOR;
        let mPrefix = this.INFO_PREFIX;

        if (match) {
            location = `${match[1]}:${match[2]}`;
        }

        // validate prefix.
        prefix = prefix.trim().toLowerCase();

        switch (prefix) {
            case 'error':
                mPrefix = this.ERROR_PREFIX;
                bgColor = this.ERROR_BG_COLOR;
                break;
            case 'warning':
                mPrefix = this.WARNING_PREFIX;
                bgColor = this.WARNING_BG_COLOR;
                break;
            case 'success':
                mPrefix = this.SUCCESS_PREFIX;
                bgColor = this.SUCCESS_BG_COLOR;
                break;
            case 'info':
                mPrefix = this.INFO_PREFIX;
                bgColor = this.INFO_BG_COLOR;
                break;
        }

        // print message.
        console.log(`
%c::::::::::::::::::::::::::::::::
::: Web2Print v1.0.0         :::
::: Created by J. Taniguchi  :::
:::=> ${mPrefix}
:::::::::::::::::::::::::::::::::%c

${message}

%c::::::::::::::::::::::::::::::::
::: Throwed at:              :::
::::::::::::::::::::::::::::::::
${location}`,
            `background: #ddd; color: ${bgColor};`,
            `color: ${bgColor};`,
            'background: transparent; color: #333333;'
        );
    }
}

module.exports = Logger;