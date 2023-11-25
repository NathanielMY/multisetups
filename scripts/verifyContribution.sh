#run this from an ec2 server with correct permissions 
CONTRIBUTOR_NUM=""
DOWNLOAD_PTAU=false
S3_BUCKET="s3://zephyr-trusted-setup"

while [ "$1" != "" ]; do
    case $1 in
     "--downloadPtau")
        DOWNLOAD_PTAU=true
        shift 1
        ;;
    "--contributorNum") 
        CONTRIBUTOR_NUM=$2
        shift 2
        ;;
    *)
        echo "Invalid command line arg $1"
        exit 1
    esac
done

node build/index.js verify_contribution --contributorNum $CONTRIBUTOR_NUM --s3bucket $S3_BUCKET --downloadPtau $DOWNLOAD_PTAU

