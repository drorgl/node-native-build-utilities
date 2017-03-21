# node-native-build-utilities

goals:
- keep track of possible prebuilt dependencies
- upload releases to github

keep each release with prebuilt binaries for platform, architecture, toolset.

basic usage:
- package.json
	- add scripts:
		"configure": "nnbu-configure",
		"gyp-configure":"node-gyp configure -Dwin_delay_load_hook=false ",
		"install": "nnbu-configure && node-gyp configure -Dwin_delay_load_hook=false"
	- add dependencies:
		"node-native-build-utilities":"drorgl/node-native-build-utilities"

- native_gyp.json
	- dependencies
		- dependency name
			- packages
				- add a list of aptitude packages
			- pkgconfig
				- add a dictionary of pkg-config packages and semver versions
			- headers
				- name
					- add an object containing arch/platform/toolset/toolset_version/source/copy
					which will determine which prebuilt sources should be used, the source has
					two components, the url download archive @ folder to include
					if you need multiple folders from the same archive, duplicate the entire object and change only the folder name, the downloader will ignore the file but set the include folder.
			- libraries
				- name
					- same as headers, only the part after the @ character will have two actions, in the source it will be included in the libraries section of the gyp file and the copy will be copied to the output folder.
			- sources
				- an array of git sources, # branch @ gypfile : target name
				the sources will be used if no pkg-config or prebuilt binaries are suitable

repeat as needed

					