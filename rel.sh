INDEX_FILE="index.html"
INIT_FILE="engine/Init.js"
VERSION_FILE="VERSION"
REL_DATE=$(date +%Y-%m-%d)
REV_INNER=$(($(git rev-list  `git rev-list --tags --no-walk --max-count=1`..HEAD --count engine)))
REV_TOTAL_OLD=$(sed -n "s:.*REVISION_TOTAL = \(.*\);:\1:p" $INIT_FILE)
REV_TOTAL=$(($REV_TOTAL_OLD+$REV_INNER))

if [ "$1" ]; then
    VERSION_NEW=$1;
else
    VERSION_OLD=$(sed -n "s:.*ENGINE_VERSION = \"\(.*\)\";:\1:p" $INIT_FILE)
    IFS=\. read -a numbers <<<"$VERSION_OLD"
    VM=$((10#${numbers[2]} + 1))
    echo $VM;
    if [ "$VM" -lt 10 ]; then
        VM=0$VM;
    fi
    VERSION_NEW=${numbers[0]}.${numbers[1]}.$VM;
fi

sed -i.bak "s/\(\?v=\).*\(\"\)/\1$VERSION_NEW\2/g" $INDEX_FILE

sed -i.bak "s/\(ENGINE_VERSION = \"\).*\(\";\)/\1$VERSION_NEW\2/g" $INIT_FILE
sed -i.bak "s/\(RELEASE_DATE = \"\).*\(\";\)/\1$REL_DATE\2/g" $INIT_FILE
sed -i.bak "s/\(REVISION_INNER = \).*\(;\)/\1$REV_INNER\2/g" $INIT_FILE
sed -i.bak "s/\(REVISION_TOTAL = \).*\(;\)/\1$REV_TOTAL\2/g" $INIT_FILE

rm $INDEX_FILE.bak
rm $INIT_FILE.bak

echo $VERSION_NEW > $VERSION_FILE

VERSION_TAG=${VERSION_NEW,,}
VERSION_TAG=${VERSION_TAG/ /.}

MESSAGE="v$VERSION_TAG

This is an automated commit."

git stage $INIT_FILE
git stage $INDEX_FILE
git stage $VERSION_FILE
git commit -m "$MESSAGE"
git tag -a "$VERSION_TAG" -m "$MESSAGE"
git push 5apps master
git push origin master --tags
