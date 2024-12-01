-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: onlib
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `available` tinyint(1) DEFAULT '1',
  `genres` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (1,'1984','George Orwell','1234567890',1,'Fantasy, Adventure'),(2,'Brave New World','Aldous Huxley','0987654321',1,'Science Fiction, Dystopian'),(3,'To Kill a Mockingbird','Harper Lee','1234567891',1,'Mystery, Thriller'),(4,'The Great Gatsby','F. Scott Fitzgerald','1234567892',1,'Unknown'),(5,'Moby Dick','Herman Melville','1234567893',1,'Unknown'),(6,'Pride and Prejudice','Jane Austen','1234567894',1,'Unknown'),(7,'War and Peace','Leo Tolstoy','1234567895',0,'Unknown'),(8,'Ulysses','James Joyce','1234567896',1,'Unknown'),(9,'The Catcher in the Rye','J.D. Salinger','1234567897',1,'Unknown'),(10,'The Odyssey','Homer','1234567898',1,'Unknown'),(22,'Harry Potter e a Pedra Filosofal','J.K. Rowling','9781781103685',1,'Unknown'),(23,'Harry Potter','S. Gunelius','9780230594104',1,'Unknown'),(24,'Harry Potter e o Príncipe Misterioso','J.K. Rowling','9781781103128',1,'Unknown'),(25,'Harry Potter','Unknown',NULL,1,'Unknown'),(26,'Harry Potter e a pedra filosofal','Joanne K. Rowling Rowling','9789722356824',1,'Unknown'),(27,'Harry Potter and International Relations','Daniel H. Nexon, Iver B. Neumann','9780742539594',1,'Unknown'),(28,'Harry Potter e o prisioneiro de Azkaban','J. K. Rowling','9789722326018',1,'Unknown'),(29,'Critical Perspectives on Harry Potter','Elizabeth E. Heilman','9781135891534',1,'Unknown'),(30,'Teaching with Harry Potter','Valerie Estelle Frankel','9781476601229',1,'Unknown'),(31,'Re-Reading Harry Potter','Suman Gupta','9780230279711',1,'Unknown'),(32,'SL Benfica','Heather Williams','9781791105990',1,'Unknown'),(33,'Placar Magazine','Unknown',NULL,1,'Unknown'),(34,'Focus On: 100 Most Popular Expatriate Footballers in Spain','Wikipedia contributors',NULL,1,'Unknown'),(35,'Placar Magazine','Unknown',NULL,1,'Unknown'),(36,'Placar Magazine','Unknown',NULL,1,'Unknown'),(37,'Placar Magazine','Unknown',NULL,1,'Unknown'),(38,'The European Game','Dan Fieldsend','9780857903464',1,'Unknown'),(39,'World Soccer Yearbook 2003','David Goldblatt','9780789489432',1,'Unknown'),(40,'Placar Magazine','Unknown',NULL,1,'Unknown'),(41,'Placar Magazine','Unknown',NULL,1,'Unknown'),(43,'Histórias de cego','Marcos Lima','9786586280135',1,'Unknown'),(44,'Nó cego','Carlos Vale Ferraz',NULL,1,'Unknown'),(45,'Grievar\'s Blood','Alexander Darwin','9780356521510',1,'Unknown'),(46,'The Combat Codes','Alexander Darwin','9780316493130',1,'Unknown'),(47,'Cantigas de Santa Maria, de Don Alfonso El Sabio','Alfonso X (King of Castile and Leon)',NULL,1,'Unknown'),(48,'Compreendendo O Cego','Maria Lucia Toledo Moraes Amiralian','9788573960051',1,'Unknown'),(49,'Nó cego','Tomaz de Figueiredo','9789722711883',1,'Unknown'),(50,'O músico cego','Vladimir Korolenko','9786586398199',1,'Unknown'),(51,'The Game of Tarot','Michael Dummett, Sylvia Mann',NULL,1,'Unknown'),(52,'Nó cego','Tomaz de Figueiredo',NULL,1,'Unknown'),(53,'Magna Carta Commemoration Essays','Henry Elliot Malden','9781584774365',1,'Unknown'),(54,'The Magna Carta Manifesto','Peter Linebaugh','9780520932708',1,'Unknown'),(55,'Magna Carta and the England of King John','Janet Senderowitz Loengard','9781843835486',1,'Unknown'),(56,'Magna Carta','David Carpenter','9780141968469',1,'Unknown'),(57,'The Signing of the Magna Carta','Debbie Levy','9780822559177',1,'Unknown'),(58,'Beyond Magna Carta','Andrew Blick','9781849469647',1,'Unknown'),(59,'Magna Carta','Zbigniew Rau, Przemysław Żurawski vel Grajewski, Marek Tracz-Tryniecki','9781317278580',1,'Unknown'),(60,'Magna Carta','Dan Jones','9781781858844',1,'Unknown'),(61,'Magna Carta and its Modern Legacy','Robert Hazell, James Melton','9781107112773',1,'Unknown'),(62,'From Norman Conquest to Magna Carta','Christopher Daniell','9780415222150',1,'Unknown'),(63,'Elementos para a historia do municipio de Lisboa','Eduardo Freire de Oliveira',NULL,1,'Unknown'),(64,'O Profeta','Khalil Gibran','9788525422477',1,'Unknown'),(65,'O Profeta Isaías','Harold Lerch',NULL,1,'Unknown'),(66,'Profeta','Yuliya Dewolfe','9781525547591',1,'Unknown'),(67,'Gabriel Il Profeta','James D. Johnson','9798892210058',1,'Unknown'),(68,'El Visitante de jasonville-Álvar , el Profeta-Aura','Germán Borda','9781466907669',1,'Unknown'),(69,'O Profeta Jeremias','Harold Lerch',NULL,1,'Unknown'),(70,'O Profeta','Kahlil Gibran','9786586189698',1,'Unknown'),(71,'Profeta Del Barrio','Unknown',NULL,1,'Unknown'),(72,'Emma Tenayuca--la Pasionaria, la Profeta','Unknown',NULL,1,'Unknown'),(73,'Profeta Joel','Leonardo Pereira',NULL,1,'Unknown'),(75,'ALADIN','Judith Pruess Bowman',NULL,1,'Unknown'),(76,'The British Drama','Unknown',NULL,1,'Unknown'),(77,'The British Theatre','Mrs. Inchbald',NULL,1,'Unknown'),(78,'The Joker','Robert Moses Peaslee, Robert G. Weiner','9781626746794',1,'Unknown'),(79,'The Dark Knight: Batman versus the Joker','N. T. Raymond','9780061561887',1,'Unknown'),(80,'Joker and Philosophy','Massimiliano L. Cappuccio, George A. Dunn, Jason T. Eberl','9781394198498',1,'Unknown'),(81,'The Sign of the Joker: The Clown Prince of Crime as a Sign','Joel West','9789004408685',1,'Unknown'),(82,'The Joker Quiz Book','Wayne Wheelwright','9781782346722',1,'Unknown'),(83,'Breaking Down Joker','Sean Redmond','9781000521610',1,'Unknown'),(84,'Heir to the Stars: Joker','Lionel Suggs','9781257201488',1,'Unknown'),(85,'Batman and the Joker','Chris Richardson','9781000169683',1,'Unknown'),(86,'The Practical Joker\'s Handbook','Tim Nyberg','9781449400293',1,'Unknown'),(88,'Romeu e Julieta','William Shakespeare, Brazil. Ministério da Educação e Saúde Pública',NULL,1,'Unknown'),(89,'Trip','Unknown',NULL,1,'Unknown'),(90,'Shakespeare on Screen: Romeo and Juliet','Victoria Bladen, Sarah Hatchuel, Nathalie Vienne-Guerrin','9781009200950',1,'Unknown'),(91,'Romeu e Julieta','William Shakespeare','9788534934602',1,'Unknown'),(92,'Cuban Music from A to Z','Helio Orovio','9780822385219',1,'Unknown'),(93,'Romeu e Julieta','Marcela Godoy, William Shakespeare','9788564823303',1,'Unknown'),(94,'Placar Magazine','Unknown',NULL,1,'Unknown'),(95,'Placar Magazine','Unknown',NULL,1,'Unknown'),(96,'Romeu i Julieta','William Shakespeare','9789724805474',1,'Unknown'),(97,'Placar Magazine','Unknown',NULL,1,'Unknown'),(98,'Hooked','Kulsum Yasmin ','9789357492614',1,'Unknown'),(99,'Hooked Rugs','Cynthia Fowler','9781351563529',1,'Unknown'),(100,'Finishing Hooked Rugs','The Editors of Rug Hooking Magazine','9780811752893',1,'Unknown'),(101,'Hooked on Cats','Joan Moshimer','9780811730419',1,'Unknown'),(102,'Celebration of Hand-Hooked Rugs XXIII','Rug Hooking Magazine','9780811712644',1,'Unknown'),(103,'Pictorial Hooked Rugs','Jane Halliwell Green','9781881982791',1,'Unknown'),(104,'Geometric Hooked Rugs','Gail Dufresne','9781881982715',1,'Unknown'),(105,'Hooked Rugs of the Midwest','Mary Collins Barile','9781614239482',1,'Unknown'),(106,'Hooked on Heroin','Philip Lalander','9781000183627',1,'Unknown'),(107,'Celebration of Hand-Hooked Rugs XX','Rug Hooking Magazine','9781881982722',1,'Unknown'),(108,'Odisseia','Homero','9788525422903',1,'Unknown'),(109,'Iliada de Homero','Homer',NULL,1,'Unknown'),(110,'Odisseia','Homero','9788592886141',1,'Unknown'),(111,'Ilíada','Homero','9786555250053',1,'Unknown'),(112,'Homero','Pierre Carlier','9788446021513',1,'Unknown'),(113,'Ilíada','Homero','9788577154418',1,'Unknown'),(114,'O Mundo de Homero','Pierre Vidal-Naquet','9788535902051',1,'Unknown'),(115,'Homero','C. M. Bowra','9788424940379',1,'Unknown'),(116,'Odisseia (Edição comentada)','Homero','9786559215492',1,'Unknown'),(117,'Platón y Homero','Flórez, Alfonso','9789587813388',1,'Unknown'),(118,'O Protocolo Caos','José Rodrigues dos Santos','9789897779671',1,'Unknown'),(119,'Protocolo y organización de eventos','Ma Teresa Otero Alvarado','9788497881692',1,'Unknown'),(120,'Clavícula','Marta Sanz','9788433937810',1,'Unknown'),(121,'Os mistérios do livro de Enoque Protocolos das realidades','Ari El Luzi',NULL,1,'Unknown'),(122,'Protocolo Ouroboros','Max Amadeus',NULL,1,'Unknown'),(123,'Corpórea. Poesía 2010-2022','Marta Sanz','9788433945884',1,'Unknown'),(124,'Protocolos de Contacto','Ricardo González Corpancho','9786589867418',1,'Unknown'),(125,'Técnicas Secretariales','Unknown','9789968311946',1,'Unknown');
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-01 10:37:39
