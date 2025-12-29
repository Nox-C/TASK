class Name {
    /**
     * Generates a class name based on the given parameters
     * @param {string} prefix The prefix of the class name
     * @param {string} name The name of the class
     * @param {string|number} [suffix] The suffix of the class name
     * @returns {string} The generated class name
     */
    static generate(prefix: string, name: string, suffix?: string | number): string {
        const className = `${prefix}${name}${suffix ? `-${suffix}` : ``}`;
        return className.replace(/[^a-zA-Z0-9_\-]/g, '');
    }
}
