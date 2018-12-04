FILE="engine/Init.js"
REL_DATE=$(date +%Y-%m-%d)
REV_INNER=$(($(git rev-list  `git rev-list --tags --no-walk --max-count=1`..HEAD --count)+1))
REV_TOTAL=$(($(git rev-list --count HEAD)+1))

if [ "$1" ]; then
    VERSION_NEW=$1;
else
    VERSION_OLD=$(sed -n "s:.*ENGINE_VERSION = \"\(.*\)\";:\1:p" $FILE)
    IFS=\. read -a numbers <<<"$VERSION_OLD"
    VERSION_NEW=${numbers[0]}.${numbers[1]}.$((${numbers[2]} + 1))
fi

sed -i.bak "s/\(ENGINE_VERSION = \"\).*\(\";\)/\1$VERSION_NEW\2/g" $FILE
sed -i.bak "s/\(RELEASE_DATE = \"\).*\(\";\)/\1$REL_DATE\2/g" $FILE
sed -i.bak "s/\(REVISION_INNER = \).*\(;\)/\1$REV_INNER\2/g" $FILE
sed -i.bak "s/\(REVISION_TOTAL = \).*\(;\)/\1$REV_TOTAL\2/g" $FILE
rm $FILE.bak

VERSION_TAG=${VERSION_NEW,,}
VERSION_TAG=${VERSION_TAG/ /.}

MESSAGE="v$VERSION_TAG

This is an automated commit."

git stage $FILE
git commit -m "$MESSAGE"
git tag -a "$VERSION_TAG" -m "$MESSAGE"
git push 5apps master
git push origin master --tags
