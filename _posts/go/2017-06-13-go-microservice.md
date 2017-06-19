---
layout: post
title: "利用Go语言构建微服务"
description: 此文Go语言构建微服务的进阶篇
category: go
---


微服务架构逐渐流行，基于容器的逐渐成为主流，加上Docker这样杀手级的应用出现，Go现在在构建微服务的上的优势越来越明显。因此需要选择一个开源的微服务框架进行学习，以帮助大家快速构建微服务。本文使用[Go-kit](https://github.com/go-kit/kit)说明其在构建微服务上的用法。以下内容来源于[Go-Kit-Demo](https://gokit.io/examples/stringsvc.html)的翻译

## 第一原则
让我们一起构建一个最小的Go-kit微服务。

### 业务逻辑

你的服务开始于你的业务逻辑.在Go-kit中，我们将一个服务当做一个接口。

```
// StringService provides operations on strings.
type StringService interface {
  Uppercase(string) (string, error)
  Count(string) int
}
```

这个接口有一个实现

```
type stringService struct{}

func (stringService) Uppercase(s string) (string, error) {
  if s == "" {
    return "", ErrEmpty
  }
  return strings.ToUpper(s), nil
}

func (stringService) Count(s string) int {
  return len(s)
}

// ErrEmpty is returned when input string is empty
var ErrEmpty = errors.New("Empty string")
```

### 请求和响应

在Go-kit中，最基本的消息模式就是RPC。因此，我们接口的每一个方法都会被模型化为一个远程调用。对于每一个方法，我们定义`请求和响应`结构体，用于获取所有的输入和输出相应的参数。

```
type uppercaseRequest struct {
  S string `json:"s"`
}

type uppercaseResponse struct {
  V   string `json:"v"`
  Err string `json:"err,omitempty"` // errors don't JSON-marshal, so we use a string
}

type countRequest struct {
  S string `json:"s"`
}

type countResponse struct {
  V int `json:"v"`
}
```

### EndPoints

Go-kit 大部分功能都会通过一个叫`endpoint`提供。

```
type Endpoint func(ctx context.Context, request interface{}) (response interface{}, err error)
```

一个`endpoint`代表一个RPC。也就是说，我们接口中的一个方法。我们将写一个适配器来将我们每一个服务的方法转换为一个`endpoint`.每一个适配器都会引用`StringService`类型的参数，并且返回与方法对应的`endpoint`.

```
import (
  "golang.org/x/net/context"
  "github.com/go-kit/kit/endpoint"
)

func makeUppercaseEndpoint(svc StringService) endpoint.Endpoint {
  return func(ctx context.Context, request interface{}) (interface{}, error) {
    req := request.(uppercaseRequest)
    v, err := svc.Uppercase(req.S)
    if err != nil {
      return uppercaseResponse{v, err.Error()}, nil
    }
    return uppercaseResponse{v, ""}, nil
  }
}

func makeCountEndpoint(svc StringService) endpoint.Endpoint {
  return func(ctx context.Context, request interface{}) (interface{}, error) {
    req := request.(countRequest)
    v := svc.Count(req.S)
    return countResponse{v}, nil
  }
}
```

### 传输者(Transports)

现在我们需要将你的服务暴露给第三方，这样第三方就可以调用。你的组织可能已经对于服务之间如何调用有自己的观点了。可能你已经使用了`Thrift`，或者通过http的json传输。Go-kit 支持多种方式传输。

对于下面这个微服务，我们通过http传输Json。Go-kit提供一个工具类，在如下包中`transport/http`.

```
import (
  "encoding/json"
  "log"
  "net/http"

  "golang.org/x/net/context"

  httptransport "github.com/go-kit/kit/transport/http"
)

func main() {
  svc := stringService{}

  uppercaseHandler := httptransport.NewServer(
    makeUppercaseEndpoint(svc),
    decodeUppercaseRequest,
    encodeResponse,
  )

  countHandler := httptransport.NewServer(
    makeCountEndpoint(svc),
    decodeCountRequest,
    encodeResponse,
  )

  http.Handle("/uppercase", uppercaseHandler)
  http.Handle("/count", countHandler)
  log.Fatal(http.ListenAndServe(":8080", nil))
}

func decodeUppercaseRequest(_ context.Context, r *http.Request) (interface{}, error) {
  var request uppercaseRequest
  if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
    return nil, err
  }
  return request, nil
}

func decodeCountRequest(_ context.Context, r *http.Request) (interface{}, error) {
  var request countRequest
  if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
    return nil, err
  }
  return request, nil
}

func encodeResponse(_ context.Context, w http.ResponseWriter, response interface{}) error {
  return json.NewEncoder(w).Encode(response)
}
```

### stringsvc1

这个完整的服务参见：[stringsvc1](https://github.com/go-kit/kit/tree/master/examples/stringsvc1)

```
$ go get github.com/go-kit/kit/examples/stringsvc1
$ stringsvc1
```

测试

```
$ curl -XPOST -d'{"s":"hello, world"}' localhost:8080/uppercase
{"v":"HELLO, WORLD","err":null}
$ curl -XPOST -d'{"s":"hello, world"}' localhost:8080/count
{"v":12}
```

## 中间件

如果没有日志和图表，那么该服务就不能被认为是正式的服务。

### 传输日志

任何需要日志的组件都应该将logger最为一个依赖，就像数据库连接一样。因此，我们在`func main`中构建我们的日志，并且将其传递给任何需要它的组件中。我们绝不使用全局日志。

我们可以将一个logger直接注入到`stringService`的实现中，但是仍然 有其他号的方案。我们称之为`middleware`，
它也被称为装饰器。一个中间件就是一个将`endpoint`作为参数并且返回一个`endpoint`的函数。

```
type Middleware func(Endpoint) Endpoint
```

而且，它可以做认识事。让我们创建一个基本的日志中间件。

```
func loggingMiddleware(logger log.Logger) Middleware {
  return func(next endpoint.Endpoint) endpoint.Endpoint {
    return func(ctx context.Context, request interface{}) (interface{}, error) {
      logger.Log("msg", "calling endpoint")
      defer logger.Log("msg", "called endpoint")
      return next(ctx, request)
    }
  }
}
```

并且将其引入到我们的每一个handlers中。

```
logger := log.NewLogfmtLogger(os.Stderr)

svc := stringService{}

var uppercase endpoint.Endpoint
uppercase = makeUppercaseEndpoint(svc)
uppercase = loggingMiddleware(log.NewContext(logger).With("method", "uppercase"))(uppercase)

var count endpoint.Endpoint
count = makeCountEndpoint(svc)
count = loggingMiddleware(log.NewContext(logger).With("method", "count"))(count)

uppercaseHandler := httptransport.Server(
  // ...
  uppercase,
  // ...
)

countHandler := httptransport.Server(
  // ...
  count,
  // ...
)
```

事实证明这项技术不仅仅对日志有用。需要Go-kit组件都被实现为endpoint中间件。


### 应用日志

但是如果我们想在我们的应用范围内记录日志，就像参数一样传递进来。事实证明我们可以为我们的服务定义中间件，并且达到一样的友好和组合化的效果。因为`StringService`已经被定义为一个接口，我们只需要定义一个新的类型包装一个已有的StringService,并将其定义为日志的职责。

```
type loggingMiddleware struct {
  logger log.Logger
  next   StringService
}

func (mw loggingMiddleware) Uppercase(s string) (output string, err error) {
  defer func(begin time.Time) {
    mw.logger.Log(
      "method", "uppercase",
      "input", s,
      "output", output,
      "err", err,
      "took", time.Since(begin),
    )
  }(time.Now())

  output, err = mw.next.Uppercase(s)
  return
}

func (mw loggingMiddleware) Count(s string) (n int) {
  defer func(begin time.Time) {
    mw.logger.Log(
      "method", "count",
      "input", s,
      "n", n,
      "took", time.Since(begin),
    )
  }(time.Now())

  n = mw.next.Count(s)
  return
}
```

在main方法中使用.

```
import (
  "os"

  "github.com/go-kit/kit/log"
  httptransport "github.com/go-kit/kit/transport/http"
)

func main() {
  logger := log.NewLogfmtLogger(os.Stderr)

  var svc StringService
  svc = stringsvc{}
  svc = loggingMiddleware{logger, svc}

  // ...

  uppercaseHandler := httptransport.NewServer(
    // ...
    makeUppercaseEndpoint(svc),
    // ...
  )

  countHandler := httptransport.NewServer(
    // ...
    makeCountEndpoint(svc),
    // ...
  )
}
```

利用endpoint中间件解决传输的问题，就像回路中断和速率限制。


### 应用仪表

在Go-kit中，仪表意味着使用`package metrics` 来记录你的服务运行数据。计算任务运行数量，记录服务的请求的响应时间，追踪内部操作数量都是仪表需要考虑的内容。

我们可以使用中间件模式来实现。

```
type instrumentingMiddleware struct {
  requestCount   metrics.Counter
  requestLatency metrics.TimeHistogram
  countResult    metrics.Histogram
  next           StringService
}

func (mw instrumentingMiddleware) Uppercase(s string) (output string, err error) {
  defer func(begin time.Time) {
    methodField := metrics.Field{Key: "method", Value: "uppercase"}
    errorField := metrics.Field{Key: "error", Value: fmt.Sprintf("%v", err)}
    mw.requestCount.With(methodField).With(errorField).Add(1)
    mw.requestLatency.With(methodField).With(errorField).Observe(time.Since(begin))
  }(time.Now())

  output, err = mw.next.Uppercase(s)
  return
}

func (mw instrumentingMiddleware) Count(s string) (n int) {
  defer func(begin time.Time) {
    methodField := metrics.Field{Key: "method", Value: "count"}
    errorField := metrics.Field{Key: "error", Value: fmt.Sprintf("%v", error(nil))}
    mw.requestCount.With(methodField).With(errorField).Add(1)
    mw.requestLatency.With(methodField).With(errorField).Observe(time.Since(begin))
    mw.countResult.Observe(int64(n))
  }(time.Now())

  n = mw.next.Count(s)
  return
}
```

将其加入我们的服务

```
import (
  stdprometheus "github.com/prometheus/client_golang/prometheus"
  kitprometheus "github.com/go-kit/kit/metrics/prometheus"
  "github.com/go-kit/kit/metrics"
)

func main() {
  logger := log.NewLogfmtLogger(os.Stderr)

  fieldKeys := []string{"method", "error"}
  requestCount := kitprometheus.NewCounter(stdprometheus.CounterOpts{
    // ...
  }, fieldKeys)
  requestLatency := metrics.NewTimeHistogram(time.Microsecond, kitprometheus.NewSummary(stdprometheus.SummaryOpts{
    // ...
  }, fieldKeys))
  countResult := kitprometheus.NewSummary(stdprometheus.SummaryOpts{
    // ...
  }, []string{}))

  var svc StringService
  svc = stringService{}
  svc = loggingMiddleware{logger, svc}
  svc = instrumentingMiddleware{requestCount, requestLatency, countResult, svc}

  // ...

  http.Handle("/metrics", stdprometheus.Handler())
}
```

### stringsvc2

完整的例子如下：[stringsvc2](https://github.com/go-kit/kit/blob/master/examples/stringsvc2)

```
$ go get github.com/go-kit/kit/examples/stringsvc2
$ stringsvc2
msg=HTTP addr=:8080
```

```
$ curl -XPOST -d'{"s":"hello, world"}' localhost:8080/uppercase
{"v":"HELLO, WORLD","err":null}
$ curl -XPOST -d'{"s":"hello, world"}' localhost:8080/count
{"v":12}
```

```
method=uppercase input="hello, world" output="HELLO, WORLD" err=null took=2.455µs
method=count input="hello, world" n=12 took=743ns
```

## 调用其他服务

服务单独存在，这是极少数情况。通常情况下，我们需要调用其他服务。这就是Go-kit用武之地。我们提供一个传输中间件我解决所有这些所带来的问题。

假如我们有我们自己的string服务叫作`different string service`用来满足`Uppercase`方法。其用来代理其他服务的请求。让我们来实现这个中间件，它被称为`ServiceMiddleware`，类似于日志和仪表中间件。

```
// proxymw implements StringService, forwarding Uppercase requests to the
// provided endpoint, and serving all other (i.e. Count) requests via the
// next StringService.
type proxymw struct {
  ctx       context.Context
  next      StringService     // Serve most requests via this service...
  uppercase endpoint.Endpoint // ...except Uppercase, which gets served by this endpoint
}
```

我们已经准确的知道endpoint，但是我们需要用其调用，而不是提供服务，其应该是一个请求。当我们使用这种方式，我们称之为客户端`endpoint`。为了调用客户端`endpoint`，我们只需要做如下转换。

```
func (mw proxymw) Uppercase(s string) (string, error) {
  response, err := mw.uppercase(mw.Context, uppercaseRequest{S: s})
  if err != nil {
    return "", err
  }
  resp := response.(uppercaseResponse)
  if resp.Err != "" {
    return resp.V, errors.New(resp.Err)
  }
  return resp.V, nil
}
```

现在，为了构建其中一个代理中间件，我们将一个代理URL字符转为一个`endpoint`。如果我们希望通过http传递json的方式，我们可以使用`transport/http`中的工具类。

```
import (
  httptransport "github.com/go-kit/kit/transport/http"
)

func proxyingMiddleware(proxyURL string, ctx context.Context) ServiceMiddleware {
  return func(next StringService) StringService {
    return proxymw{ctx, next, makeUppercaseEndpoint(ctx, proxyURL)}
  }
}

func makeUppercaseEndpoint(ctx context.Context, proxyURL string) endpoint.Endpoint {
  return httptransport.NewClient(
    "GET",
    mustParseURL(proxyURL),
    encodeUppercaseRequest,
    decodeUppercaseResponse,
  ).Endpoint()
}
```

### 服务发现和负载均衡

我们我们只有一个远程的服务，那情况就比较好，但是事实上，对我们来说，可能有许多的服务实例。我们想通过服务发现机制去发现他们，并且在它们之间扩展调用。并且如果其中的一些实例开始崩溃，我们必须处理它们，以保证我们的服务可依赖性。

Go-kit提供了一个适配器用于适配不同的服务发现系统，为了更新服务实例，需要暴露单个`endpoint`。这些适配器将会被订阅者调用。

```
type Subscriber interface {
  Endpoints() ([]endpoint.Endpoint, error)
}
```

内部实现上，订阅者使用提供的工厂方法来将每一个发现的实例字符(类型 host:port)转换为一个可用的`endpoint`.

```
type Factory func(instance string) (endpoint.Endpoint, error)
```

目前为止，我们的工厂方法，`makeUppercaseEndpoint`，直接调用URL。但是放置一些安全的中间件到你的工厂中也很非常重要，例如回路中断，速率限制。

```
var e endpoint.Endpoint
e = makeUppercaseProxy(ctx, instance)
e = circuitbreaker.Gobreaker(gobreaker.NewCircuitBreaker(gobreaker.Settings{}))(e)
e = kitratelimit.NewTokenBucketLimiter(jujuratelimit.NewBucketWithRate(float64(maxQPS), int64(maxQPS)))(e)
}
```

现在，我们已经有了一系列的`endpoint`，我们需要选择其中一个。负载均衡包含订阅者，并且选择其中一个`endpoint`。Go-kit 提供基本的负载均衡实现，如果你想一些更加高级的功能，你可以非常容易的实现自己的。

```
type Balancer interface {
  Endpoint() (endpoint.Endpoint, error)
}
```

现在我们已经有能力根据一些策略选取`endpoint`。我们可以使用它给开发者提供一个简单，合理的，强大的`endpoint`.重试机制也包含进了负载均衡，并且返回一个可用的`endpoint`.重试策略将会重试失败的请求直至达到最大请求书或者达到超时时间。

```
func Retry(max int, timeout time.Duration, lb Balancer) endpoint.Endpoint
```

让我们连线最后的代理中间件。简单讲，我们假设使用者会指定多个独立的实例`endpoints`.

```
func proxyingMiddleware(instances string, ctx context.Context, logger log.Logger) ServiceMiddleware {
  // If instances is empty, don't proxy.
  if instances == "" {
    logger.Log("proxy_to", "none")
    return func(next StringService) StringService { return next }
  }

  // Set some parameters for our client.
  var (
    qps         = 100                    // beyond which we will return an error
    maxAttempts = 3                      // per request, before giving up
    maxTime     = 250 * time.Millisecond // wallclock time, before giving up
  )

  // Otherwise, construct an endpoint for each instance in the list, and add
  // it to a fixed set of endpoints. In a real service, rather than doing this
  // by hand, you'd probably use package sd's support for your service
  // discovery system.
  var (
    instanceList = split(instances)
    subscriber   sd.FixedSubscriber
  )
  logger.Log("proxy_to", fmt.Sprint(instanceList))
  for _, instance := range instanceList {
    var e endpoint.Endpoint
    e = makeUppercaseProxy(ctx, instance)
    e = circuitbreaker.Gobreaker(gobreaker.NewCircuitBreaker(gobreaker.Settings{}))(e)
    e = kitratelimit.NewTokenBucketLimiter(jujuratelimit.NewBucketWithRate(float64(qps), int64(qps)))(e)
    subscriber = append(subscriber, e)
  }

  // Now, build a single, retrying, load-balancing endpoint out of all of
  // those individual endpoints.
  balancer := lb.NewRoundRobin(subscriber)
  retry := lb.Retry(maxAttempts, maxTime, balancer)

  // And finally, return the ServiceMiddleware, implemented by proxymw.
  return func(next StringService) StringService {
    return proxymw{ctx, next, retry}
  }
}
```

### stringsvc3 

完整例子如下：[stringsvc3](https://github.com/go-kit/kit/tree/master/examples/stringsvc3)

```
$ go get github.com/go-kit/kit/examples/stringsvc3
$ stringsvc3 -listen=:8001 &
listen=:8001 caller=proxying.go:25 proxy_to=none
listen=:8001 caller=main.go:72 msg=HTTP addr=:8001
$ stringsvc3 -listen=:8002 &
listen=:8002 caller=proxying.go:25 proxy_to=none
listen=:8002 caller=main.go:72 msg=HTTP addr=:8002
$ stringsvc3 -listen=:8003 &
listen=:8003 caller=proxying.go:25 proxy_to=none
listen=:8003 caller=main.go:72 msg=HTTP addr=:8003
$ stringsvc3 -listen=:8080 -proxy=localhost:8001,localhost:8002,localhost:8003
listen=:8080 caller=proxying.go:29 proxy_to="[localhost:8001 localhost:8002 localhost:8003]"
listen=:8080 caller=main.go:72 msg=HTTP addr=:8080
```

```
$ for s in foo bar baz ; do curl -d"{\"s\":\"$s\"}" localhost:8080/uppercase ; done
{"v":"FOO","err":null}
{"v":"BAR","err":null}
{"v":"BAZ","err":null}
```

```
listen=:8001 caller=logging.go:28 method=uppercase input=foo output=FOO err=null took=5.168µs
listen=:8080 caller=logging.go:28 method=uppercase input=foo output=FOO err=null took=4.39012ms
listen=:8002 caller=logging.go:28 method=uppercase input=bar output=BAR err=null took=5.445µs
listen=:8080 caller=logging.go:28 method=uppercase input=bar output=BAR err=null took=2.04831ms
listen=:8003 caller=logging.go:28 method=uppercase input=baz output=BAZ err=null took=3.285µs
listen=:8080 caller=logging.go:28 method=uppercase input=baz output=BAZ err=null took=1.388155ms
```

