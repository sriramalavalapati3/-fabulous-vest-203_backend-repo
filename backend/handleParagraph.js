let groups = {};

function handleParagraph(groupID) {
  if (groups[groupID]) {
    return true;
  } else {
    return false;
  }
}

function deleteRoooID(roupID) {
  
    delete groups[roupID];

  return;
 }
module.exports = { groups, handleParagraph,deleteRoooID};
