MDS.init(function (msg) {
  if (msg.event === 'inited') {
    MDS.sql("CREATE TABLE IF NOT EXISTS logs (id bigint auto_increment,message varchar(2048) NOT NULL)");
  } else if (msg.event === 'MINIMALOG') {
    MDS.sql(`INSERT INTO logs (message) VALUES ('${msg.data.message}')`);
  }
});
