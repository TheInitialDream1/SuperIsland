# MediaRemote Adapter

Bundled version: [v0.7.5](https://github.com/ungive/mediaremote-adapter/tree/v0.7.5)
Revision: cc5d90aa0b633acc34a8c44197b5fcb309958935
License: BSD-3-Clause (see LICENSE).

The framework and Perl entrypoint are shipped together. This revision fixes the
incorrect return type used for asynchronous elapsed-time commands, which could
exit the adapter before a seek reached the player (upstream PR #34).

The bundled arm64 framework is built from the pinned repository's src/adapter,
src/private and src/utility Objective-C files (excluding src/test) with clang:

```
clang -dynamiclib -arch arm64 -mmacosx-version-min=14.0 -fobjc-arc \
  -fvisibility=default -Iinclude -Isrc -framework Foundation -framework AppKit \
  -framework JavaScriptCore -framework UniformTypeIdentifiers \
  -install_name @rpath/MediaRemoteAdapter.framework/Versions/A/MediaRemoteAdapter \
  <source files> -o MediaRemoteAdapter.framework/Versions/A/MediaRemoteAdapter
codesign --force --deep --sign - MediaRemoteAdapter.framework
```

The application copies the framework to Contents/Frameworks and the matching
Perl script, license and this provenance note to Contents/Resources.
