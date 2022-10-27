const pinFileToIPFS = async (path, name, description) => {
  const {create} = await import ("ipfs-core");
    const client = await create();
    const pathImage = await client.add({
      name: name,
      path: path
    });
      
    const metadata = new Object();
    metadata.image = `http://ipfs.io/ipfs/` + pathImage.path;
    metadata.name = name;
    metadata.description = description;

    const metaPath = await client.add(JSON.stringify(metadata));

    await client.stop();
    return `http://ipfs.io/ipfs/` + String(metaPath.cid);
    
}

module.exports = {
  pinFileToIPFS,
}