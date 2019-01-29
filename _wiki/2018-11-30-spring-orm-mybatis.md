---
layout: wiki
title: "【开发框架】- MyBatis核心要点"
categories: [开发框架]
description: Mybatis概述
keywords: Mybatis
---

# 概述

本文将依赖[Mybatis源码分析书](http://www.tianxiaobo.com/categories/java-framework/mybatis/)作为指导，提取Mybatis的核心要点

# 主流ORM框架使用对比
本节主要分析访问数据库的多种方式，进而理解框架是如何一步一步在JDBC的基础上实现的
## 使用JDBC访问数据库
这里的示例代码仅仅作为样例参考，仅用于展示其使用方式，具体详细使用请参考官方文档
```java
public class test {
    @Test
    public void testJdbc() {
        String url = "jdbc:mysql://localhost:3306/myblog?user=root&……";
        Connection conn = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(url);
            String author = "coolblog.xyz";
            String date = "2018.06.10";
            String sql = "SELECT id, title, author, content, create_time"
                    + " FROM article"
                    + " WHERE author = '" + author
                    + "' AND create_time > '" + date + "'";
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql);
            List<Article> articles = new ArrayList<>(rs.getRow());
            while (rs.next()) {
                Article article = new Article();
                article.setId(rs.getInt("id"));
                article.setTitle(rs.getString("title"));
                article.setAuthor(rs.getString("author"));
                article.setContent(rs.getString("content"));
                article.setCreateTime(rs.getDate("create_time"));
                articles.add(article);
            }
            System.out.println("Query SQL ==> " + sql);
            System.out.println("Query Result: ");
            articles.forEach(System.out::println);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```
## 使用SpringJDBC访问数据库

### application.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <context:property-placeholder location="jdbc.properties"/>
    <bean id="dataSource"
          class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="${jdbc.driver}" />
        <property name="url" value="${jdbc.url}" />
        <property name="username" value="${jdbc.username}" />
        <property name="password" value="${jdbc.password}" />
    </bean>
    <bean id="jdbcTemplate"
          class="org.springframework.jdbc.core.JdbcTemplate">
        <property name="dataSource" ref="dataSource" />
    </bean>
</beans>
```

### SpringJDBCTest

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:chapter1/application.xml")
public class SpringJdbcTest {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Test
    public void testSpringJdbc() {
        String author = "coolblog.xyz";
        String date = "2018.06.10";
        String sql = "SELECT id, title, author, content, create_time"
                + " FROM blog_article"
                + " WHERE author = '" + author
                + "' AND create_time > '" + date + "'";
        List<Article> articles = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Article article = new Article();
            article.setId(rs.getInt("id"));
            article.setTitle(rs.getString("title"));
            article.setAuthor(rs.getString("author"));
            article.setContent(rs.getString("content"));
            article.setCreateTime(rs.getDate("create_time"));
            return article;
        });
        System.out.println("Query SQL ==> " + sql);
        System.out.println("Spring JDBC Query Result: ");
        articles.forEach(System.out::println);
    }
}
```

## 使用Mybatis访问数据库

### Mapper.xml

```xml
<mapper namespace="xyz.coolblog.chapter1.dao.ArticleDao">
    <select id="findByAuthorAndCreateTime" resultType="Article">
        SELECT
        `id`, `title`, `author`, `content`, `create_time`
        FROM
        `article`
        WHERE
        `author` = #{author} AND `create_time` > #{createTime}
    </select>
</mapper>
```

### Mapper Dao

```java
public interface ArticleDao {
    List<Article> findByAuthorAndCreateTime(@Param("author") String author,
                                            @Param("createTime") String createTime);
}
```

### Mybatis-config.xml

```xml
<configuration>
    <properties resource="jdbc.properties"/>
    <typeAliases>
        <typeAlias alias="Article"
                   type="xyz.coolblog.chapter1.model.ArticleDO"/>
        <typeAlias alias="Author" type="xyz.coolblog.model.AuthorDO"/>
    </typeAliases>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${jdbc.driver}"/>
                <property name="url" value="${jdbc.url}"/>
                <property name="username" value="${jdbc.username}"/>
                <property name="password" value="${jdbc.password}"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <mapper resource="chapter1/mapper/ArticleMapper.xml"/>
    </mappers>
</configuration>

```

### MyBatis Java Test

```java
public class MyBatisTest {
    private SqlSessionFactory sqlSessionFactory;
    @Before
    public void prepare() throws IOException {
        String resource = "chapter1/mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        sqlSessionFactory = new
                SqlSessionFactoryBuilder().build(inputStream);
        inputStream.close();
    }
    @Test
    public void testMyBatis() throws IOException {
        SqlSession session = sqlSessionFactory.openSession();
        try {
            ArticleDao articleDao = session.getMapper(ArticleDao.class);
            List<Article> articles = articleDao.
                    findByAuthorAndCreateTime("coolblog.xyz", "2018-06-10");
        } finally {
            session.commit();
            session.close();
        }
    }
}
```

# MyBatis 使用入门

## 单独使用MyBatis

### 数据库访问层的接口定义
```java
public interface AuthorDao {
    Author findOne(@Param("id") int id);
}
```
### 接口对用的Mapper定义
```xml
<!-- AuthorMapper.xml -->
<mapper namespace="xyz.coolblog.chapter1.dao2.AuthorDao">
    <resultMap id="articleResult" type="Article">
        <id property="id" column="article_id" />
        <result property="title" column="title"/>
        <result property="type" column="type"/>
        <result property="content" column="content"/>
        <result property="createTime" column="create_time"/>
    </resultMap>
    <resultMap id="authorResult" type="Author">
        <id property="id" column="id"/>
        <result property="name" column="name"/>
        <result property="age" column="age"/>
        <result property="sex" column="sex"
                typeHandler="org.apache.ibatis.type.EnumOrdinalTypeHandler"/>
        <result property="email" column="email"/>
        <collection property="articles" resultMap="articleResult"/>
    </resultMap>
    <select id="findOne" resultMap="authorResult">
        SELECT
        au.id, au.name, au.age, au.sex, au.email, ar.id as article_id,
        ar.title, ar.type, ar.content, ar.create_time
        FROM
        author au, article ar
        WHERE
        au.id = ar.author_id AND au.id = #{id}
    </select>
</mapper>
```
### MyBatis 的配置文件

```xml
<!-- mybatis-config2.xml -->
<configuration>
    <properties resource="jdbc.properties"/>
    <typeAliases>
        <typeAlias alias="Article"
                   type="xyz.coolblog.chapter1.model2.ArticleDO"/>
        <typeAlias alias="Author"
                   type="xyz.coolblog.chapter1.model2.AuthorDO"/>
    </typeAliases>
    <typeHandlers>
        <typeHandler handler="xyz.coolblog.mybatis.ArticleTypeHandler"
                     javaType="xyz.coolblog.constant.ArticleTypeEnum"/>
    </typeHandlers>
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${jdbc.driver}"/>
                <property name="url" value="${jdbc.url}"/>
                <property name="username" value="${jdbc.username}"/>
                <property name="password" value="${jdbc.password}"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <mapper resource="chapter1/mapper2/AuthorMapper.xml"/>
        <mapper resource="chapter1/mapper2/ArticleMapper.xml"/>
    </mappers>
</configuration>
```
### 单元测试

```java
public class MyBatisTest2 {
    private SqlSessionFactory sqlSessionFactory;

    @Before
    public void prepare() throws IOException {
        String resource = "chapter1/mybatis-config2.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        sqlSessionFactory =
                new SqlSessionFactoryBuilder().build(inputStream);
        inputStream.close();
    }

    @Test
    public void testOne2One() {
        SqlSession session = sqlSessionFactory.openSession();
        try {
            ArticleDao articleDao = session.getMapper(ArticleDao.class);
            ArticleDO article = articleDao.findOne(1);
            AuthorDO author = article.getAuthor();
            article.setAuthor(null);
            System.out.println("\nauthor info:");
            System.out.println(author);
            System.out.println("\narticles info:");
            System.out.println(article);
        } finally {
            session.close();
        }
    }
}    
```

## 在 Spring 中使用MyBatis

### Maven依赖配置

```xml
<project>
    <properties>
        <spring.version>4.3.17.RELEASE</spring.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.4.6</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>1.3.2</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-beans</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
            <version>${spring.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

### Spring集成配置

```xml
<!-- application-mybatis.xml -->
<beans>
    <context:property-placeholder location="jdbc.properties"/>
    <!-- 配置数据源 -->
    <bean id="dataSource"
          class="org.apache.ibatis.datasource.pooled.PooledDataSource">
        <property name="driver" value="${jdbc.driver}" />
        <property name="url" value="${jdbc.url}" />
        <property name="username" value="${jdbc.username}" />
        <property name="password" value="${jdbc.password}" />
    </bean>
    <!-- 配置 SqlSessionFactory -->
    <bean id="sqlSessionFactory"
          class="org.mybatis.spring.SqlSessionFactoryBean">
        <!-- 配置 mybatis-config.xml 路径 -->
        <property name="configLocation"
                  value="classpath:chapter1/mybatis-config3.xml"/>
        <!-- 给 SqlSessionFactory 配置数据源，这里引用上面的数据源配置 -->
        <property name="dataSource" ref="dataSource"/>
        <!-- 配置 SQL 映射文件 -->
        <property name="mapperLocations" value="chapter1/mapper2/*.xml"/>
    </bean>
    <!-- 配置 MapperScannerConfigurer -->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <!-- 配置 Dao 接口所在的包 -->
        <property name="basePackage" value="xyz.coolblog.chapter1.dao2"/>
    </bean>
</beans>
```

### Mybatis配置

```xml
<!-- mybatis-config3.xml -->
<configuration>
    <settings>
        <setting name="cacheEnabled" value="true"/>
    </settings>
    <typeAliases>
        <typeAlias alias="Article"
                   type="xyz.coolblog.chapter1.model2.Article"/>
        <typeAlias alias="Author"
                   type="xyz.coolblog.chapter1.model2.Author"/>
    </typeAliases>
    <typeHandlers>
        <typeHandler handler="xyz.coolblog.mybatis.ArticleTypeHandler"
                     javaType="xyz.coolblog.constant.ArticleTypeEnum"/>
    </typeHandlers>
</configuration>
```

### 单元测试

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:chapter1/application-mybatis.xml")
public class SpringWithMyBatisTest implements ApplicationContextAware {
    private ApplicationContext applicationContext;
    /**
     * 自动注入 AuthorDao，无需再通过 SqlSession 获取
     */
    @Autowired
    private AuthorDao authorDao;
    @Autowired
    private ArticleDao articleDao;

    @Before
    public void printBeanInfo() {
        ListableBeanFactory lbf = applicationContext;
        String[] beanNames = lbf.getBeanDefinitionNames();
        Arrays.sort(beanNames);
        System.out.println("\n--------------☆ bean name ☆-------------");
        Arrays.asList(beanNames).subList(0, 5).forEach(System.out::println);
        AuthorDao authorDao =
                (AuthorDao) applicationContext.getBean("authorDao");
        ArticleDao articleDao =
                (ArticleDao) applicationContext.getBean("articleDao");
        System.out.println("\n-----------☆ bean class info ☆------------");
        System.out.println("AuthorDao Class: " + authorDao.getClass());
        System.out.println("ArticleDao Class: " + articleDao.getClass());
        System.out.println("\n-------xxxx--------xxxx-------xxx--------\n");
    }

    @Test
    public void testOne2One() {
        Article article = articleDao.findOne(1);
        Author author = article.getAuthor();
        article.setAuthor(null);
        System.out.println("\nauthor info:");
        System.out.println(author);
        System.out.println("\narticles info:");
        System.out.println(article);
    }
}
```

> 以上没有列出__数据库访问层的接口定义__,__Mapper定义文件__，参考[单独使用MyBatis配置](#单独使用mybatis)

# 原理分析
## 配置文件的解析过程
* __<font color="#dd0000">良好的开源项目必定提供良好的配置，以支持其高级特性以及更好的扩展</font>__

### 配置文件说明
* __properties__  

```xml
<properties resource="jdbc.properties">
    <property name="jdbc.username" value="coolblog"/>
    <property name="hello" value="world"/>
</properties>

```
* __settings__
  - 解析 settings 子节点的内容，并将解析结果转成 Properties 对象
  - 为 Configuration 创建元信息对象
  - 通过 MetaClass 检测 Configuration 中是否存在某个属性的 setter 方法，
不存在则抛异常
  - 若通过 MetaClass 的检测，则返回 Properties 对象，方法逻辑结束

```xml
<settings>
    <setting name="cacheEnabled" value="true"/>
    <setting name="lazyLoadingEnabled" value="true"/>
    <setting name="autoMappingBehavior" value="PARTIAL"/>
</settings>
```  

* typeAliases

```xml
<typeAliases>
    <package name="xyz.coolblog.chapter2.model1"/>
    <package name="xyz.coolblog.chapter2.model2"/>
</typeAliases>

<typeAliases>
    <typeAlias alias="article" type="xyz.coolblog.chapter2.model.Article" />
    <typeAlias alias="author" type="xyz.coolblog.chapter2.model.Author" />
</typeAliases>
```

* plugins

```xml
<plugins>
    <plugin interceptor="xyz.coolblog.mybatis.ExamplePlugin">
        <property name="key" value="value"/>
    </plugin>
</plugins>
```
* environments

```xml
<environments default="development">
    <environment id="development">
        <transactionManager type="JDBC"/>
        <dataSource type="POOLED">
            <property name="driver" value="${jdbc.driver}"/>
            <property name="url" value="${jdbc.url}"/>
            <property name="username" value="${jdbc.username}"/>
            <property name="password" value="${jdbc.password}"/>
        </dataSource>
    </environment>
</environments>
```

* typeHandlers

```xml
<!-- 自动扫描-->
<typeHandlers>
    <package name="xyz.coolblog.handlers"/>
</typeHandlers>
<!-- 手动配置 -->
<typeHandlers>
<typeHandler jdbcType="TINYINT"
             javaType="xyz.coolblog.constant.ArticleTypeEnum"
             handler="xyz.coolblog.mybatis.ArticleTypeHandler"/>
</typeHandlers>
```

## 映射文件解析过程
> 实际是解析Mapper的配置，并映射到对应的pojo对象上，实现数据自动映射

### 缓存配置文件
#### cache


```xml
<cache
        eviction="FIFO"
        flushInterval="60000"
        size="512"
        readOnly="true"/>
```

* 按先进先出的策略淘汰缓存项
* 缓存的容量为 512 个对象引用
* 缓存每隔 60 秒刷新一次
* 缓存返回的对象是写安全的，即在外部修改对象不会影响到缓存内部存储对象

> 第三方缓存或者内置缓存

```xml
<cache type="org.mybatis.caches.ehcache.EhcacheCache"/>
    <property name="timeToIdleSeconds" value="3600"/>
    <property name="timeToLiveSeconds" value="3600"/>
    <property name="maxEntriesLocalHeap" value="1000"/>
    <property name="maxEntriesLocalDisk" value="10000000"/>
    <property name="memoryStoreEvictionPolicy" value="LRU"/>
</cache>
```

#### cache-ref

```xml
<!-- Mapper1.xml -->
<mapper namespace="xyz.coolblog.dao.Mapper1">
    <!-- Mapper1 与 Mapper2 共用一个二级缓存 -->
    <cache-ref namespace="xyz.coolblog.dao.Mapper2"/>
</mapper>
        <!-- Mapper2.xml -->
<mapper namespace="xyz.coolblog.dao.Mapper2">
    <cache/>
</mapper>
```

### resultMap

`resultMap` 元素是 MyBatis 中最重要最强大的元素。它可以让你从 90% 的 JDBC ResultSets 数据提取代码中解放出来, 并在一些情形下允许你做一些 JDBC 不支持的事情。 实际上，在对复杂语句进行联合映射的时候，它很可能可以代替数千行的同等功能的代码。 ResultMap 的设计思想是，简单的语句不需要明确的结果映射，而复杂一点的语句只需要描述它们的关系就行了。 

> 基于resultType简单pojo配置  

这种配置，使用resultType指定pojo，MyBatis 会在幕后自动创建一个 ResultMap，再基于属性名来映射列到 JavaBean 的属性上

> 基于resultMap配置，下面是关于ResultMap属性配置说明

#### id&result
这些是结果映射最基本的内容。id 和 result 都将一个列的值映射到一个简单数据类型(字符串,整型,双精度浮点数,日期等)的属性或字段   

```xml
<id property="id" column="post_id"/>
<result property="subject" column="post_subject"/>
```

#### constructor  

```xml
//指定name防止出现构造函数参数顺序问题导致出现歧义
<constructor>
   <idArg column="id" javaType="int" name="id" />
   <arg column="age" javaType="_int" name="age" />
   <arg column="username" javaType="String" name="username" />
</constructor>
```

#### association

单一对象引用

> 基本配置

```xml
<association property="author" column="blog_author_id" javaType="Author">
  <id property="id" column="author_id"/>
  <result property="username" column="author_username"/>
</association>
```

* 嵌套查询:通过执行另外一个 SQL 映射语句来返回预期的复杂类型。

```xml
<resultMap id="blogResult" type="Blog">
  <association property="author" column="author_id" javaType="Author" select="selectAuthor"/>
</resultMap>

<select id="selectBlog" resultMap="blogResult">
  SELECT * FROM BLOG WHERE ID = #{id}
</select>

<select id="selectAuthor" resultType="Author">
  SELECT * FROM AUTHOR WHERE ID = #{id}
</select>
```

> 这种方式很简单, 但是对于大型数据集合和列表将不会表现很好。 问题就是我们熟知的 “N+1 查询问题”。

* 嵌套结果:使用嵌套结果映射来处理重复的联合结果的子集。首先,让我们来查看这个元素的属性。所有的你都会看到,它和普通的只由 select 和 resultMap 属性的结果映射不同。 

> 嵌套查询SQL语句

```sql
<select id="selectBlog" resultMap="blogResult">
  select
    B.id            as blog_id,
    B.title         as blog_title,
    B.author_id     as blog_author_id,
    A.id            as author_id,
    A.username      as author_username,
    A.password      as author_password,
    A.email         as author_email,
    A.bio           as author_bio
  from Blog B left outer join Author A on B.author_id = A.id
  where B.id = #{id}
</select>
```

> 嵌套查询两种配置

```xml
<!--嵌套查询重用配置 -->
<resultMap id="blogResult" type="Blog">
  <id property="id" column="blog_id" />
  <result property="title" column="blog_title"/>
  <association property="author" column="blog_author_id" javaType="Author" resultMap="authorResult"/>
</resultMap>

<resultMap id="authorResult" type="Author">
  <id property="id" column="author_id"/>
  <result property="username" column="author_username"/>
  <result property="password" column="author_password"/>
  <result property="email" column="author_email"/>
  <result property="bio" column="author_bio"/>
</resultMap>

<!-- 嵌套查询单一配置-->
```xml
<resultMap id="blogResult" type="Blog">
  <id property="id" column="blog_id" />
  <result property="title" column="blog_title"/>
  <association property="author" javaType="Author">
    <id property="id" column="author_id"/>
    <result property="username" column="author_username"/>
    <result property="password" column="author_password"/>
    <result property="email" column="author_email"/>
    <result property="bio" column="author_bio"/>
  </association>
</resultMap>
```

#### collection
对象集合引用配置

* 集合的嵌套查询

```xml
<resultMap id="blogResult" type="Blog">
  <collection property="posts" javaType="ArrayList" column="id" ofType="Post" select="selectPostsForBlog"/>
</resultMap>

<select id="selectBlog" resultMap="blogResult">
  SELECT * FROM BLOG WHERE ID = #{id}
</select>

<select id="selectPostsForBlog" resultType="Post">
  SELECT * FROM POST WHERE BLOG_ID = #{id}
</select>
```

* 集合的嵌套结果

> 嵌套查询SQL

```xml
<select id="selectBlog" resultMap="blogResult">
  select
  B.id as blog_id,
  B.title as blog_title,
  B.author_id as blog_author_id,
  P.id as post_id,
  P.subject as post_subject,
  P.body as post_body,
  from Blog B
  left outer join Post P on B.id = P.blog_id
  where B.id = #{id}
</select>
```

> 嵌套查询配置

```xml
<!-- 嵌套查询单一配置-->
<resultMap id="blogResult" type="Blog">
  <id property="id" column="blog_id" />
  <result property="title" column="blog_title"/>
  <collection property="posts" ofType="Post">
    <id property="id" column="post_id"/>
    <result property="subject" column="post_subject"/>
    <result property="body" column="post_body"/>
  </collection>
</resultMap>

<!--嵌套查询重用配置 -->
<resultMap id="blogResult" type="Blog">
  <id property="id" column="blog_id" />
  <result property="title" column="blog_title"/>
  <collection property="posts" ofType="Post" resultMap="blogPostResult" columnPrefix="post_"/>
</resultMap>

<resultMap id="blogPostResult" type="Post">
  <id property="id" column="id"/>
  <result property="subject" column="subject"/>
  <result property="body" column="body"/>
</resultMap>
```

### SQL操作

#### select
```xml
<select
  id="selectPerson"
  parameterType="int"
  parameterMap="deprecated"
  resultType="hashmap"
  resultMap="personResultMap"
  flushCache="false"
  useCache="true"
  timeout="10000"
  fetchSize="256"
  statementType="PREPARED"
  resultSetType="FORWARD_ONLY">
```
#### insert, update 和 delete

```xml
<insert
  id="insertAuthor"
  parameterType="domain.blog.Author"
  flushCache="true"
  statementType="PREPARED"
  keyProperty=""
  keyColumn=""
  useGeneratedKeys=""
  timeout="20">

<update
  id="updateAuthor"
  parameterType="domain.blog.Author"
  flushCache="true"
  statementType="PREPARED"
  timeout="20">

<delete
  id="deleteAuthor"
  parameterType="domain.blog.Author"
  flushCache="true"
  statementType="PREPARED"
  timeout="20">
```

#### sql
这个元素可以被用来定义可重用的 SQL 代码段，可以包含在其他语句中。它可以被静态地(在加载参数) 参数化. 不同的属性值通过包含的实例变化

```xml
<sql id="userColumns"> ${alias}.id,${alias}.username,${alias}.password </sql>
```

### 动态 SQL

MyBatis 的强大特性之一便是它的动态 SQL。如果你有使用 JDBC 或其它类似框架的经验，你就能体会到根据不同条件拼接 SQL 语句的痛苦。例如拼接时要确保不能忘记添加必要的空格，还要注意去掉列表最后一个列名的逗号。利用动态 SQL 这一特性可以彻底摆脱这种痛苦。

## 插件机制

* [Mybatis分页插件](https://github.com/pagehelper/Mybatis-PageHelper)

## 事务管理

* __<font color="#dd0000">[待分析]</font>Spring事务管理是如何代理Mybatis内部事务的__

# 参考资料

* [Mybatis官方中文文档](http://www.mybatis.org/mybatis-3/zh/index.html)
* [Mybatis源码分析](http://www.tianxiaobo.com/categories/java-framework/mybatis/)
* [Mybatis-Spring](http://www.mybatis.org/spring/zh/index.html)