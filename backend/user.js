const users = [];

function User(id, username, roomvalue) {

  let vp = true;
  users.filter((Element) => {
    if (Element.username == username) {
        vp = false;
    }
  });


  const user = { id, username, roomvalue, userSet: new Set() };
  if(vp == true){
    users.push(user);
    return user;
  }else{
    return "Username already exists"
  }

}

function update_word_function(socketID, typedText) {
  let one_user = users.filter((el, ind) => {
    if (el.id == socketID) {
      if (!el.userSet.has(typedText)) {
        el.userSet.add(typedText);
        el.wordCount = el.userSet.size;
      }
      return el;
    }
  });

  return one_user;
}

module.exports = { User, update_word_function, users };
