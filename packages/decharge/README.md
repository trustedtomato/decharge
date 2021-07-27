![Decharge's banner](https://raw.githubusercontent.com/trustedtomato/decharge/master/packages/decharge/banner.svg)

decharge is a very-static site generator.
It doesn't emit any JavaScript by default but is built on JSX,
so one might say it removes the charge from your code.

## Why?
I tried out Astro, but the IDE support was really bad on my computer,
dynamic routes were not the way I'd like and (in my opinion) it had a
lot of unneccessary bloat going on.
I tried to fix these issues with this project.

## Goals
- The bloaty things should be opt-in.
- Don't add anything to the core which would result in an unwanted chunk of output when building.
- Don't add any feature which hasn't got neat IDE support (syntax highlighting, autocompletion and linting).

## Documentation
See [the project's website](https://trustedtomato.github.io/decharge/).