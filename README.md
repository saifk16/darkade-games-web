# Darkade Web

## Version 1.0 Checklist

- [ ] Games Page (*/games* & */games/<game-slug>*)
  - [ ] A list of games (in a grid or something) each with an image and a title
  - [ ] Games should have tags like `Fully Accessible`, `Mostly Accessible`, `Partially Accessible`, `Mod(s) Required`, etc.
  - [ ] Page for a specific game - with the game's image, title, tags, a description section with the game's long description, an accessibility section with accessibility resources like more detailed description of how it's accessible, what mods it needs if any etc. etc. and also maybe a play button that quickly pops up everything you need to play e.g. where you can buy the game, links to the mods etc.
  - [ ] To get games' details we can use IGDB'a API.
- [ ] Mods Page (*/mods* & */mods/<mod-slug>* We can discuss how to route this)
  - [ ] A home page/readme detailing an overview of the mod, supported languages, features, etc.
  - [ ] Features page detailing all the features, some features may be bifurcated into separate, sub-pages.
  - [ ] Keybindings page - detailing all key bindings added by the mod.
  - [ ] Configuration page - detailing how the mod can be configured.
  - [ ] Guides page - the author can write some docs and users can share their own.
  - [ ] An issue tracker - possibly connected to github
  - [ ] A chat room/discussions page
  - [ ] The docs of each mod should be served from the mod's github repository, upon updates the mod authors will have to manually sync the repo in the website. We may provide an API that they can add to their CI/CD pipeline to trigger the syncing process.
- [ ] User authentication by email and GitHub (if possible GitLab) but NOT Google.
- [ ] We should also aim to support i18n from the start.

(Will add more as we go)