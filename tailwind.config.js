/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: "#4f585f",
                primary: "#f2a72f",
                secondary: "#c2c1be",
                disabled: "#6a6a69",
                primaryText: "#000000",
                secondaryText: "#acacac",
                specialText: "#f7b956",
                tagDone: "#44ff00",
                tagInprogress: "#44d2f9",
                tagDraft: "#ffff5b",
                alert: "#f93a3a",
            },
        },
    },
    plugins: [],
};
