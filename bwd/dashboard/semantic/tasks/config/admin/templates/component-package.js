
Package.describe({
    name: "semantic:ui-{component}",
    summary: "Semantic UI - {Component}: Single component release",
    version: "{version}",
    git: "git://github.com/Semantic-Org/UI-{Component}.git",
});

Package.onUse((api) => {
    api.versionsFrom("1.0");
    api.addFiles([
    { files },
    ], "client");
});
