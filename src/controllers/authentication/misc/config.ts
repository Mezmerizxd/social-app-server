class Config {
    public max_username_length = 20;
    public min_password_length = 6;
    public illegal_username_characters: string[] = [
        ' ',
        '!',
        '@',
        '#',
        '$',
        '%',
        '^',
        '&',
        '*',
        '(',
        ')',
        '-',
        '_',
        '+',
        '=',
        '|',
        '{',
        '}',
        '[',
        ']',
        ':',
        ';',
        '"',
        "'",
        ',',
        '.',
        '?',
        '/',
        '\\',
        '>',
        '<',
        '~',
        '`',
        ' ',
    ];
}
export default new Config();
