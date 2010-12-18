keypair=$USER  # or some name that is meaningful to you
publickeyfile=$HOME/.ssh/id_rsa.pub
regions=$(ec2-describe-regions | cut -f2)

for region in $regions; do
  echo $region
  ec2-import-keypair --region $region --public-key-file $publickeyfile $keypair
done

