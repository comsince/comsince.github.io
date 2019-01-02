---
layout: wiki
title: "【开发框架】- Spring核心要点"
categories: [开发框架]
description: Spring容器
keywords: Spring Ioc
---

## 探索Spring IoC容器
### Spring IoC容器
Spring 的扩展机制在很多框架中都有所使用，具体可以参考开源项目`Apollo`

* __BeanDefinition__: 容器中的每一个bean都会有一个对应的BeanDefinition实例，该实例负责保存bean对象的所有必要信息，包括bean对象的class类型、是否是抽象类、构造方法和参数、其它属性等等。当客户端向容器请求相应对象时，容器就会通过这些信息为客户端返回一个完整可用的bean实例

* __DefaultListableBeanFactory__:作为一个比较通用的BeanFactory实现，它同时也实现了`BeanDefinitionRegistry`接口，因此它就承担了Bean的注册管理工作。从图中也可以看出，BeanFactory接口中主要包含getBean、containBean、getType、getAliases等管理bean的方法，而BeanDefinitionRegistry接口则包含registerBeanDefinition、removeBeanDefinition、getBeanDefinition等注册管理BeanDefinition的方法。

* 模拟BeanFactory底层

```
// 默认容器实现
DefaultListableBeanFactory beanRegistry = new DefaultListableBeanFactory();
// 根据业务对象构造相应的BeanDefinition
AbstractBeanDefinition definition = new RootBeanDefinition(Business.class,true);
// 将bean定义注册到容器中
beanRegistry.registerBeanDefinition("beanName",definition);
// 如果有多个bean，还可以指定各个bean之间的依赖关系
// ........

// 然后可以从容器中获取这个bean的实例
// 注意：这里的beanRegistry其实实现了BeanFactory接口，所以可以强转，
// 单纯的BeanDefinitionRegistry是无法强制转换到BeanFactory类型的
BeanFactory container = (BeanFactory)beanRegistry;
Business business = (Business)container.getBean("beanName");
```

### Spring IoC容器的整个工作流程

* __容器启动阶段__

  容器启动时，会通过某种途径加载Configuration MetaData。除了代码方式比较直接外，在大部分情况下，容器需要依赖某些工具类，比如：BeanDefinitionReader，BeanDefinitionReader会对加载的Configuration MetaData进行解析和分析，并将分析后的信息组装为相应的BeanDefinition，最后把这些保存了bean定义的BeanDefinition，注册到相应的BeanDefinitionRegistry，这样容器的启动工作就完成了。这个阶段主要完成一些准备性工作，更侧重于bean对象管理信息的收集，当然一些验证性或者辅助性的工作也在这一阶段完成。

* __Bean的实例化阶段__

  经过第一阶段，所有bean定义都通过BeanDefinition的方式注册到BeanDefinitionRegistry中，当某个请求通过容器的getBean方法请求某个对象，或者因为依赖关系容器需要隐式的调用getBean时，就会触发第二阶段的活动：容器会首先检查所请求的对象之前是否已经实例化完成。如果没有，则会根据注册的BeanDefinition所提供的信息实例化被请求对象，并为其注入依赖。当该对象装配完毕后，容器会立即将其返回给请求方法使用。

**NOTE:** `ApplicationContext`，它构建在BeanFactory之上，属于更高级的容器，除了具有BeanFactory的所有能力之外，还提供对事件监听机制以及国际化的支持等。它管理的bean，在容器启动时全部完成初始化和依赖注入操作。


### Spring容器扩展机制

IoC容器负责管理容器中所有bean的生命周期，而在bean生命周期的不同阶段，Spring提供了不同的扩展点来改变bean的命运。在容器的启动阶段，BeanFactoryPostProcessor允许我们在容器实例化相应对象之前，对注册到容器的BeanDefinition所保存的信息做一些额外的操作，比如修改bean定义的某些属性或者增加其他信息等。
![image](https://upload-images.jianshu.io/upload_images/175724-0d50d67d980161b4.png)
__BeanFactoryPostProcessor__ 处理bean的定义，而 __BeanPostProcessor__ 则处理bean完成实例化后的对象

**完整的Bean声明周期图**
![image](/images/wiki/spring-bean-lifecycle.png)

## JavaConfig与常见Annotation

###JavaConfig

* XML配置方式来描述bean的定义

```
<bean id="bookService" class="cn.moondev.service.BookServiceImpl"></bean>
```

* 基于JavaConfig的配置形式

```
@Configuration
public class MoonBookConfiguration {
    // 任何标志了@Bean的方法，其返回值将作为一个bean注册到Spring的IOC容器中
    // 方法名默认成为该bean定义的id
    @Bean
    public BookService bookService() {
        return new BookServiceImpl();
    }
}
```

* 两个bean之间有依赖关系的话，在XML配置中应该是这样

```
<bean id="bookService" class="cn.moondev.service.BookServiceImpl">
    <property name="dependencyService" ref="dependencyService"/>
</bean>

<bean id="otherService" class="cn.moondev.service.OtherServiceImpl">
    <property name="dependencyService" ref="dependencyService"/>
</bean>

<bean id="dependencyService" class="DependencyServiceImpl"/>

```

* JavaConfig 配置

```
@Configuration
public class MoonBookConfiguration {

    // 如果一个bean依赖另一个bean，则直接调用对应JavaConfig类中依赖bean的创建方法即可
    // 这里直接调用dependencyService()
    @Bean
    public BookService bookService() {
        return new BookServiceImpl(dependencyService());
    }

    @Bean
    public OtherService otherService() {
        return new OtherServiceImpl(dependencyService());
    }

    @Bean
    public DependencyService dependencyService() {
        return new DependencyServiceImpl();
    }
}
```


### @ComponentScan

**@ComponentScan**注解对应XML配置形式中的`<context:component-scan>`元素，表示启用组件扫描，Spring会自动扫描所有通过注解配置的bean，然后将其注册到IOC容器中

### @Import

@Import注解用于导入配置类

**NOTE:** 在4.2之前，@Import注解只支持导入配置类，但是在4.2之后，它支持导入普通类，并将这个类作为一个bean的定义注册到IOC容器中。

```
@Configuration
public class MoonBookConfiguration {
    @Bean
    public BookService bookService() {
        return new BookServiceImpl();
    }
}
```

导入配置类

```
@Configuration
// 可以同时导入多个配置类，比如：@Import({A.class,B.class})
@Import(MoonBookConfiguration.class)
public class MoonUserConfiguration {
    @Bean
    public UserService userService(BookService bookService) {
        return new BookServiceImpl(bookService);
    }
}
```

### @Conditional

<font color="#dd0000">@Conditional注解表示在满足某种条件后才初始化一个bean或者启用某些配置。</font>它一般用在由@Component、@Service、@Configuration等注解标识的类上面，或者由@Bean标记的方法上。如果一个@Configuration类标记了@Conditional，则该类中所有标识了@Bean的方法和@Import注解导入的相关类将遵从这些条件。

#### 内置condition


#### 自定义Condition

* 实现condition接口

```
public class JdbcTemplateCondition implements Condition {

    @Override
    public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata annotatedTypeMetadata) {
        try {
        conditionContext.getClassLoader().loadClass("org.springframework.jdbc.core.JdbcTemplate");
            return true;
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        return false;
    }
}
```

* 使用

```
@Conditional(JdbcTemplateCondition.class)
@Service
public MyService service() {
    ......
}
```


### @ConfigurationProperties与@EnableConfigurationProperties

#### 单一value配置

```
// jdbc config
jdbc.mysql.url=jdbc:mysql://localhost:3306/sampledb
jdbc.mysql.username=root
jdbc.mysql.password=123456
......

// 配置数据源
@Configuration
public class HikariDataSourceConfiguration {

    @Value("jdbc.mysql.url")
    public String url;
    @Value("jdbc.mysql.username")
    public String user;
    @Value("jdbc.mysql.password")
    public String password;
    
    @Bean
    public HikariDataSource dataSource() {
        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(url);
        hikariConfig.setUsername(user);
        hikariConfig.setPassword(password);
        // 省略部分代码
        return new HikariDataSource(hikariConfig);
    }
}
```

#### ConfigurationProperties 复杂注解

```
@Component
//  还可以通过@PropertySource("classpath:jdbc.properties")来指定配置文件
@ConfigurationProperties("jdbc.mysql")
// 前缀=jdbc.mysql，会在配置文件中寻找jdbc.mysql.*的配置项
pulic class JdbcConfig {
    public String url;
    public String username;
    public String password;
}

@Configuration
public class HikariDataSourceConfiguration {

    @AutoWired
    public JdbcConfig config;
    
    @Bean
    public HikariDataSource dataSource() {
        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(config.url);
        hikariConfig.setUsername(config.username);
        hikariConfig.setPassword(config.password);
        // 省略部分代码
        return new HikariDataSource(hikariConfig);
    }
}
```

> `@EnableConfigurationProperties`注解表示对@ConfigurationProperties的内嵌支持，默认会将对应Properties Class作为bean注入的IOC容器中，即在相应的Properties类上不用加@Component注解。


## 参考资料

* [给你一份Spring Boot知识清单](https://www.jianshu.com/p/83693d3d0a65)
* [Java类加载器之线程上下文类加载器](http://blog.onlycatch.com/post/Java%E7%B1%BB%E5%8A%A0%E8%BD%BD%E6%9C%BA%E5%88%B6)
* [深入探讨 Java 类加载器](https://www.ibm.com/developerworks/cn/java/j-lo-classloader/)