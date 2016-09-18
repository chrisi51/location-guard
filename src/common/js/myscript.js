/*var pokemonNamesDE={1:'Bulbasaur',2:'Ivysaur',3:'Venusaur',4:'Charmander',5:'Charmeleon',6:'Charizard',7:'Squirtle',8:'Wartortle',9:'Blastoise',10:'Caterpie',11:'Metapod',12:'Butterfree',13:'Weedle',14:'Kakuna',15:'Beedrill',16:'Pidgey',17:'Pidgeotto',18:'Pidgeot',19:'Rattata',20:'Raticate',21:'Spearow',22:'Fearow',23:'Ekans',24:'Arbok',25:'Pikachu',26:'Raichu',27:'Sandshrew',28:'Sandslash',29:'Nidoran F',30:'Nidorina',31:'Nidoqueen',32:'Nidoran M',33:'Nidorino',34:'Nidoking',35:'Clefairy',36:'Clefable',37:'Vulpix',38:'Ninetales',39:'Jigglypuff',40:'Wigglytuff',41:'Zubat',42:'Golbat',43:'Oddish',44:'Gloom',45:'Vileplume',46:'Paras',47:'Parasect',48:'Venonat',49:'Venomoth',50:'Diglett',51:'Dugtrio',52:'Meowth',53:'Persian',54:'Psyduck',55:'Golduck',56:'Mankey',57:'Primeape',58:'Growlithe',59:'Arcanine',60:'Poliwag',61:'Poliwhirl',62:'Poliwrath',63:'Abra',64:'Kadabra',65:'Alakazam',66:'Machop',67:'Machoke',68:'Machamp',69:'Bellsprout',70:'Weepinbell',71:'Victreebel',72:'Tentacool',73:'Tentacruel',74:'Geodude',75:'Graveler',76:'Golem',77:'Ponyta',78:'Rapidash',79:'Slowpoke',80:'Slowbro',81:'Magnemite',82:'Magneton',83:'Farfetch\'d',84:'Doduo',85:'Dodrio',86:'Seel',87:'Dewgong',88:'Grimer',89:'Muk',90:'Shellder',91:'Cloyster',92:'Gastly',93:'Haunter',94:'Gengar',95:'Onix',96:'Drowzee',97:'Hypno',98:'Krabby',99:'Kingler',100:'Voltorb',101:'Electrode',102:'Exeggcute',103:'Exeggutor',104:'Cubone',105:'Marowak',106:'Hitmonlee',107:'Hitmonchan',108:'Lickitung',109:'Koffing',110:'Weezing',111:'Rhyhorn',112:'Rhydon',113:'Chansey',114:'Tangela',115:'Kangaskhan',116:'Horsea',117:'Seadra',118:'Goldeen',119:'Seaking',120:'Staryu',121:'Starmie',122:'Mr. Mime',123:'Scyther',124:'Jynx',125:'Electabuzz',126:'Magmar',127:'Pinsir',128:'Tauros',129:'Magikarp',130:'Gyarados',131:'Lapras',132:'Ditto',133:'Eevee',134:'Vaporeon',135:'Jolteon',136:'Flareon',137:'Porygon',138:'Omanyte',139:'Omastar',140:'Kabuto',141:'Kabutops',142:'Aerodactyl',143:'Snorlax',144:'Articuno',145:'Zapdos',146:'Moltres',147:'Dratini',148:'Dragonair',149:'Dragonite',150:'Mewtwo',151:'Mew',};
*/
var pokemons={
  0:{"name":"MissingNo"}, 
  1:{"name":"Bisasam", "prio":2}, 
  2:{"name":"Bisaknosp", "prio":1}, 
  3:{"name":"Bisaflor", "prio":1}, 
  4:{"name":"Glumanda", "prio":1}, 
  5:{"name":"Glutexo", "prio":1}, 
  6:{"name":"Glurak", "prio":1}, 
  7:{"name":"Schiggy", "prio":2}, 
  8:{"name":"Schillok", "prio":2}, 
  9:{"name":"Turtok", "prio":1}, 
  10:{"name":"Raupy", "prio":5}, 
  11:{"name":"Safcon", "prio":4}, 
  12:{"name":"Smettbo", "prio":3}, 
  13:{"name":"Hornliu", "prio":5}, 
  14:{"name":"Kokuna", "prio":4}, 
  15:{"name":"Bibor", "prio":4}, 
  16:{"name":"Taubsi", "prio":5}, 
  17:{"name":"Tauboga", "prio":4}, 
  18:{"name":"Tauboss", "prio":4}, 
  19:{"name":"Rattfratz", "prio":5}, 
  20:{"name":"Rattikarl", "prio":4}, 
  21:{"name":"Habitak", "prio":5}, 
  22:{"name":"Ibitak", "prio":4}, 
  23:{"name":"Rettan", "prio":3}, 
  24:{"name":"Arbok", "prio":2}, 
  25:{"name":"Pikachu", "prio":1, "speaking":"Pikatschu"}, 
  26:{"name":"Raichu", "prio":1}, 
  27:{"name":"Sandan", "prio":2}, 
  28:{"name":"Sandamer", "prio":1}, 
  29:{"name":"Nidoran♀", "prio":3, "speaking":"Nidoran weiblich"}, 
  30:{"name":"Nidorina", "prio":2}, 
  31:{"name":"Nidoqueen", "prio":1}, 
  32:{"name":"Nidoran♂", "prio":3, "speaking":"Nidoran männlich"}, 
  33:{"name":"Nidorino", "prio":2}, 
  34:{"name":"Nidoking", "prio":1}, 
  35:{"name":"Piepi", "prio":2, "speaking":"Pipi"}, 
  36:{"name":"Pixi", "prio":2}, 
  37:{"name":"Vulpix", "prio":2}, 
  38:{"name":"Vulnona", "prio":1}, 
  39:{"name":"Pummeluff", "prio":2}, 
  40:{"name":"Knuddeluff", "prio":1}, 
  41:{"name":"Zubat", "prio":5}, 
  42:{"name":"Golbat", "prio":4}, 
  43:{"name":"Myrapla", "prio":3}, 
  44:{"name":"Duflor", "prio":2}, 
  45:{"name":"Giflor", "prio":1}, 
  46:{"name":"Paras", "prio":5}, 
  47:{"name":"Parasek", "prio":4}, 
  48:{"name":"Bluzuk", "prio":4}, 
  49:{"name":"Omot", "prio":3}, 
  50:{"name":"Digda", "prio":2}, 
  51:{"name":"Digdri", "prio":1}, 
  52:{"name":"Mauzi", "prio":3}, 
  53:{"name":"Snobilikat", "prio":2}, 
  54:{"name":"Enton", "prio":4}, 
  55:{"name":"Entoron", "prio":3}, 
  56:{"name":"Menki", "prio":2}, 
  57:{"name":"Rasaff", "prio":1}, 
  58:{"name":"Fukano", "prio":2}, 
  59:{"name":"Arkani", "prio":1}, 
  60:{"name":"Quapsel", "prio":5}, 
  61:{"name":"Quaputzi", "prio":3}, 
  62:{"name":"Quappo", "prio":1}, 
  63:{"name":"Abra", "prio":4}, 
  64:{"name":"Kadabra", "prio":3}, 
  65:{"name":"Simsala", "prio":1}, 
  66:{"name":"Machollo", "prio":2}, 
  67:{"name":"Maschock", "prio":1}, 
  68:{"name":"Machomei", "prio":1}, 
  69:{"name":"Knofensa", "prio":3, "speaking":"Knofänssa"}, 
  70:{"name":"Ultrigaria", "prio":2}, 
  71:{"name":"Sarzenia", "prio":1}, 
  72:{"name":"Tentacha", "prio":3}, 
  73:{"name":"Tentoxa", "prio":2}, 
  74:{"name":"Kleinstein", "prio":2}, 
  75:{"name":"Georok", "prio":1}, 
  76:{"name":"Geowaz", "prio":1}, 
  77:{"name":"Ponita", "prio":2}, 
  78:{"name":"Gallopa", "prio":1}, 
  79:{"name":"Flegmon", "prio":2}, 
  80:{"name":"Lahmus", "prio":1}, 
  81:{"name":"Magnetilo", "prio":2}, 
  82:{"name":"Magneton", "prio":1}, 
  83:{"name":"Porenta", "prio":1}, 
  84:{"name":"Dodu", "prio":2}, 
  85:{"name":"Dodri", "prio":1}, 
  86:{"name":"Jurob", "prio":2}, 
  87:{"name":"Jugong", "prio":1}, 
  88:{"name":"Sleima", "prio":2}, 
  89:{"name":"Sleimok", "prio":2}, 
  90:{"name":"Muschas", "prio":3, "speaking":"Mutschass"}, 
  91:{"name":"Austos", "prio":1}, 
  92:{"name":"Nebulak", "prio":3, "speaking":"Nebullack"}, 
  93:{"name":"Alpollo", "prio":2}, 
  94:{"name":"Gengar", "prio":1}, 
  95:{"name":"Onix", "prio":2}, 
  96:{"name":"Traumato", "prio":4}, 
  97:{"name":"Hypno", "prio":3}, 
  98:{"name":"Krabby", "prio":4}, 
  99:{"name":"Kingler", "prio":3}, 
  100:{"name":"Voltobal", "prio":2}, 
  101:{"name":"Lektrobal", "prio":1}, 
  102:{"name":"Owei", "prio":2}, 
  103:{"name":"Kokowei", "prio":1}, 
  104:{"name":"Tragosso", "prio":1}, 
  105:{"name":"Knogga", "prio":2}, 
  106:{"name":"Kicklee", "prio":2}, 
  107:{"name":"Nockchan", "prio":2}, 
  108:{"name":"Schlurp", "prio":2, "speaking":"Schlürp"}, 
  109:{"name":"Smogon", "prio":3}, 
  110:{"name":"Smogmog", "prio":2}, 
  111:{"name":"Rihorn", "prio":1}, 
  112:{"name":"Rizeros", "prio":1}, 
  113:{"name":"Chaneira", "prio":1, "speaking":"Tschaneira"}, 
  114:{"name":"Tangela", "prio":2}, 
  115:{"name":"Kangama", "prio":2}, 
  116:{"name":"Seeper", "prio":2}, 
  117:{"name":"Seemon", "prio":1}, 
  118:{"name":"Goldini", "prio":3}, 
  119:{"name":"Golking", "prio":2}, 
  120:{"name":"Sterndu", "prio":3}, 
  121:{"name":"Starmie", "prio":2}, 
  122:{"name":"Pantimos", "prio":2}, 
  123:{"name":"Sichlor", "prio":1}, 
  124:{"name":"Rossana", "prio":2}, 
  125:{"name":"Elektek", "prio":1}, 
  126:{"name":"Magmar", "prio":1}, 
  127:{"name":"Pinsir", "prio":1}, 
  128:{"name":"Tauros", "prio":1}, 
  129:{"name":"Karpador", "prio":4}, 
  130:{"name":"Garados", "prio":1}, 
  131:{"name":"Lapras", "prio":1}, 
  132:{"name":"Ditto", "prio":1}, 
  133:{"name":"Evoli", "prio":3}, 
  134:{"name":"Aquana", "prio":1}, 
  135:{"name":"Blitza", "prio":1}, 
  136:{"name":"Flamara", "prio":1}, 
  137:{"name":"Porygon", "prio":1}, 
  138:{"name":"Amonitas", "prio":3}, 
  139:{"name":"Amoroso", "prio":1}, 
  140:{"name":"Kabuto", "prio":2}, 
  141:{"name":"Kabutops", "prio":1}, 
  142:{"name":"Aerodactyl", "prio":2}, 
  143:{"name":"Relaxo", "prio":1}, 
  144:{"name":"Arktos", "prio":1}, 
  145:{"name":"Zapdos", "prio":1}, 
  146:{"name":"Lavados", "prio":1}, 
  147:{"name":"Dratini", "prio":1}, 
  148:{"name":"Dragonir", "prio":1}, 
  149:{"name":"Dragoran", "prio":1}, 
  150:{"name":"Mewtu", "prio":1}, 
  151:{"name":"Mew","prio":1}, 
}

var stimmen = window.speechSynthesis.getVoices();
/*
function createPokeIcon(pokemonid, timestamp, filtered) {
    now = new Date();
    b = now.getHours(); c = now.getMinutes(); d = now.getSeconds();
    if(b < 10){b = '0'+b;} 
    if(c < 10){c = '0'+c;} 
    if(d < 10){d = '0'+d;}
    zeit = b+':'+c+':'+d;
    
    timeleft = new Date(timestamp - (now.getTime()));
//    console.log(pokemons[pokemonid]+" ("+pokemonid+") "+timeleft.getMinutes()+":"+timeleft.getSeconds()+"("+timestamp+")");
    
    loganhang="";
    if(pokemons[pokemonid]["prio"]<4){
      var snd = new Audio("chrome-extension://oalfdefioopjemjanjoaoajblpnoilcn/sounds/important.mp3"); // buffers automatically when created
      if(pokemons[pokemonid]["prio"]==3) {
        snd.volume = 0.05;
        msg_pre="";
        loganhang="                    <";
      }else if(pokemons[pokemonid]["prio"]==2){
        snd.volume = 0.1;
        msg_pre="Oooh";
        loganhang="                    <<<<<";
      }else if(pokemons[pokemonid]["prio"]==1){
        snd.volume = 0.2;
        msg_pre="ACHTUNG!";
        loganhang="                    <<<<<<<<<<<<<<<";
      }
      if(timeleft.getMinutes()>2 && timeleft.getMinutes()<20){
        snd.play();
        var msg = new SpeechSynthesisUtterance(', , '+msg_pre+' Pockemonn Prio '+pokemons[pokemonid]["prio"]+'gefunden: '+((pokemons[pokemonid]["speaking"]) ? pokemons[pokemonid]["speaking"] : pokemons[pokemonid]["name"])+', noch '+timeleft.getMinutes()+' Minuten');
        msg.volume = 1;
        msg.voice = stimmen[10];
        window.speechSynthesis.speak(msg);
      }
    }
    console.log(zeit+': '+pokemons[pokemonid]["name"]+' gefunden - Prio '+pokemons[pokemonid]["prio"]+' ('+timeleft.getMinutes()+':'+timeleft.getSeconds()+') '+loganhang);
    
    
    return new L.HtmlIcon({
        pokemonid: pokemonid,
        expire: timestamp,
        hide: filtered
    });
}





*/








function addPokemonToMap(spawn) {
    var j;
    var toAdd = true;
    for (j in shownMarker) {
        if (shownMarker[j].id == spawn.encounter_id) {
            toAdd = false;
            break
        }
    }
    if (toAdd) {
        var cp = new L.LatLng(spawn.latitude, spawn.longitude);
        var pokeid = PokemonIdList[spawn.pokemon_id];
        var filtered = false;
        if(parseInt(pokeid) in filterdict) {
            filtered = true;
        }
        var pokeMarker = new L.marker(cp, {
            icon: createPokeIcon(pokeid, spawn.expiration_timestamp_ms, filtered)
        });
        shownMarker.push({
            marker: pokeMarker,
            expire: spawn.expiration_timestamp_ms,
            id: spawn.encounter_id,
            active: true
        });
        map.addLayer(pokeMarker);
        pokeMarker.setLatLng(cp);
        
        
        
        PokeSpawnNotification(spawn, pokeid);

    }
}






function PokeSpawnNotification(spawn, pokemonid){
    var timestamp = spawn.expiration_timestamp_ms;
    
    now = new Date();
    b = now.getHours(); c = now.getMinutes(); d = now.getSeconds();
    if(b < 10){b = '0'+b;} 
    if(c < 10){c = '0'+c;} 
    if(d < 10){d = '0'+d;}
    zeit = b+':'+c+':'+d;
    
    timeleft = new Date(timestamp - (now.getTime()));
//    console.log(pokemons[pokemonid]+" ("+pokemonid+") "+timeleft.getMinutes()+":"+timeleft.getSeconds()+"("+timestamp+")");
    
    loganhang="";
    if(pokemons[pokemonid]["prio"]<4){
      var snd = new Audio("chrome-extension://oalfdefioopjemjanjoaoajblpnoilcn/sounds/important.mp3"); // buffers automatically when created
      if(pokemons[pokemonid]["prio"]==3) {
        snd.volume = 0.05;
        msg_pre="";
        loganhang="                    <";
      }else if(pokemons[pokemonid]["prio"]==2){
        snd.volume = 0.1;
        msg_pre="Oooh";
        loganhang="                    <<<<<";
      }else if(pokemons[pokemonid]["prio"]==1){
        snd.volume = 0.2;
        msg_pre="ACHTUNG!";
        loganhang="                    <<<<<<<<<<<<<<<";
      }
      if(timeleft.getMinutes()>2 && timeleft.getMinutes()<20){
        /*Area-Definitions*/
        /*
          * Kloppenheim
          * 50.236912532271866,8.740696907043459
          * 50.23098311891053,8.753228187561037
          * Wohngebiet
          * 50.236651763390164,8.758356571197512
          * 50.23305575231405,8.764257431030275
          * Bahnhof/Kino
          * 50.23416752516015,8.753571510314943
          * 50.23138118132209,8.757970333099367
          * Neidharts
          * 50.23182728180007,8.756189346313478
          * 50.23083899204558,8.757669925689699
          * Industriegebiet
          * 50.231202739962306,8.754773139953615
          * 50.22101674941629,8.767497539520265
          * OKarben
          * 50.25796148218113,8.748121261596681
          * 50.2441311465723,8.760867118835451
          * Petterweil
          * 50.247808651366846,8.710012435913088
          * 50.23685763367847,8.729152679443361
          * Dortelweil
          * 50.21316299140583,8.733100891113283
          * 50.200528360782364,8.756103515625002
          * Großkarben
          * 50.24363713177181,8.763785362243654
          * 50.22980263842708,8.780736923217775
          * Kleinkarben
          * 50.22903393775093,8.766918182373049
          * 50.21832574717402,8.785715103149416
          * Rendel
          * 50.217419559192784,8.784427642822267
          * 50.21176236026309,8.80009174346924
          * Gronau
          * 50.19668237449501,8.769063949584963
          * 50.18838497755282,8.79258155822754
          * Bad Vilbel
          * 50.196297758824976,8.719024658203127
          * 50.16876221865776,8.75541687011719
          */
        var area="";
        if(spawn.latitude < 50.236912532271866 && spawn.latitude > 50.23098311891053 && spawn.longitude > 8.740696907043459 && spawn.longitude < 8.753228187561037) area = "in Kloppenheim";
        else if(spawn.latitude < 50.236651763390164 && spawn.latitude > 50.23305575231405 && spawn.longitude > 8.758356571197512 && spawn.longitude < 8.764257431030275) area = "in direkter Nähe";
        else if(spawn.latitude < 50.23182728180007 && spawn.latitude > 50.23083899204558 && spawn.longitude > 8.756189346313478 && spawn.longitude < 8.757669925689699) area = "bei Neidharts";
        else if(spawn.latitude < 50.23416752516015 && spawn.latitude > 50.23138118132209 && spawn.longitude > 8.753571510314943 && spawn.longitude < 8.757970333099367) area = "zwischen Kino und Bahnhof";
        else if(spawn.latitude < 50.231202739962306 && spawn.latitude > 50.22101674941629 && spawn.longitude > 8.754773139953615 && spawn.longitude < 8.767497539520265) area = "im Industriegebiet";
        else if(spawn.latitude < 50.25796148218113 && spawn.latitude > 50.2441311465723 && spawn.longitude > 8.748121261596681 && spawn.longitude < 8.760867118835451) area = "in O-karben";
        else if(spawn.latitude < 50.247808651366846 && spawn.latitude > 50.23685763367847 && spawn.longitude > 8.710012435913088 && spawn.longitude < 8.729152679443361) area = "in Petterweil";
        else if(spawn.latitude < 50.21316299140583 && spawn.latitude > 50.200528360782364 && spawn.longitude > 8.733100891113283 && spawn.longitude < 8.756103515625002) area = "in Dortelweil";
        else if(spawn.latitude < 50.24363713177181 && spawn.latitude > 50.22980263842708 && spawn.longitude > 8.763785362243654 && spawn.longitude < 8.780736923217775) area = "in Groß-Karben";
        else if(spawn.latitude < 50.22903393775093 && spawn.latitude > 50.21832574717402 && spawn.longitude > 8.766918182373049 && spawn.longitude < 8.785715103149416) area = "in Klein-Karben";
        else if(spawn.latitude < 50.217419559192784 && spawn.latitude > 50.21176236026309 && spawn.longitude > 8.784427642822267 && spawn.longitude < 8.80009174346924) area = "in Rendel";
        else if(spawn.latitude < 50.19668237449501 && spawn.latitude > 50.18838497755282 && spawn.longitude > 8.769063949584963 && spawn.longitude < 8.79258155822754) area = "in Gronau";
        else if(spawn.latitude < 50.196297758824976 && spawn.latitude > 50.16876221865776 && spawn.longitude > 8.719024658203127 && spawn.longitude < 8.75541687011719) area = "in Bad Vilbel";
        
        snd.play();
        var msg = new SpeechSynthesisUtterance(', , '+msg_pre+' Pockemonn Prio '+pokemons[pokemonid]["prio"]+'gefunden: '+((pokemons[pokemonid]["speaking"]) ? pokemons[pokemonid]["speaking"] : pokemons[pokemonid]["name"])+', noch '+timeleft.getMinutes()+' Minuten '+((area) ? area : ""));
        msg.volume = 1;
        msg.voice = stimmen[10];
        window.speechSynthesis.speak(msg);
      }
    }
    console.log(zeit+': '+pokemons[pokemonid]["name"]+' gefunden - Prio '+pokemons[pokemonid]["prio"]+' ('+timeleft.getMinutes()+':'+timeleft.getSeconds()+') '+((area) ? area : "")+ ' '+loganhang);

}






/*
1474194588634
1474194920212

*/