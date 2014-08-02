#!/bin/bash
# build.sh: build JAR and XPI files from source
rm fangs-old.xpi
mv fangs.xpi fangs-old.xpi
rm -rf tmpbuild
mkdir tmpbuild
cp -vR ../fangs/* ./tmpbuild/
cd tmpbuild
cd chrome
zip -r fangs.jar * -x \.DS_Store
cd ..
zip -r ../fangs.xpi * -x \.DS_Store
cd ..
rm -rf ./tmpbuild
