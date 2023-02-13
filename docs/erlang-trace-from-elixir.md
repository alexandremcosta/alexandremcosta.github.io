# Erlang trace in Elixir

To use Erlang trace from Elixir code is something I always take a long time to remember/find, so
I'm placing it here to never forget.

This is a simple trick to test function calls that don't belong to your process. For example, when
you need to test an isolated GenServer or Task.

```elixir
# start trace
:erlang.trace_pattern({ModuleName, :_, :_}, [{:_, [], [{:return_trace}]}])
:erlang.trace(:all, true, [:call])

# receive messages...

# stop trace
:erlang.trace(:all, false, [:call])
```

While trace is running, when there is a `call` to any function of `ModuleName`, the caller process
receives a message with information about the call. Also, we can use `{ModuleName, :function_name, ["args"]}`.

There are other options like instead of `:all`, you can trace any of: `:processes`, `:ports`, `:existing`,
`:existing_processes`, `:existing_ports`, `:new`, `:new_processes`, `:new_ports`.

Along with `:call`, you can use other flags, such as: `:send`, `:receive`, `:exiting`, ...

Let's see it in action:

```elixir
Interactive Elixir (1.13.4) - press Ctrl+C to exit (type h() ENTER for help)
iex(1)> :erlang.trace(:all, true, [:call])
57
iex(2)> :erlang.trace_pattern({List, :first, :_}, [{:_, [], [{:return_trace}]}])
2
iex(3)> Task.start_link(fn -> List.first([]) end)
{:ok, #PID<0.111.0>}
iex(4)> flush
{:trace, #PID<0.111.0>, :call, {List, :first, [[]]}}
{:trace, #PID<0.111.0>, :return_from, {List, :first, 1}, nil}
:ok
```

On the first message we received, we shows the call arguments. On the second, it shows the returned value `nil`.

### Caveat
Don't use [:erlang.trace/3](https://www.erlang.org/doc/man/erlang.html#trace-3) to debug production code.
Instead, use [recon_trace](https://ferd.github.io/recon/recon_trace.html) and read chapter 9 of [Erlang in Anger](https://www.erlang-in-anger.com)
which is free and a great resource to learn advanced Erlang.

You cannot use this to test the current process, even if you pass `self()` to the trace function.
If you need that, you might consider creating an external tracer process:

```elixir
defmodule FunctionTracer do
  def start(mfa) do
    Task.start(fn ->
      :erlang.trace(:all, true, [:call])
      :erlang.trace_pattern(mfa, [{:_, [], [{:return_trace}]}])
      loop()
    end)
  end

  defp loop do
    receive do
      {:trace, pid, :call, {module, function, arguments}} ->
        IO.puts("""
        Function #{module}:#{function} invoked
        with arguments #{inspect(arguments)} in process #{inspect(pid)}
        """)

      {:trace, pid, :return_from, {module, function, arity}, return_value} ->
        IO.puts("""
        Function #{module}:#{function}/#{arity}
        returned #{inspect(return_value)} in process #{inspect(pid)}
        """)

      _msg ->
        :ok
    end

    loop()
  end

  def stop(pid) do
    :erlang.trace(:all, false, [:call])
    Process.exit(pid, :kill)
  end
end
```

And use it like this:

```elixir
iex> {:ok, pid} = FunctionTracer.start({List, :first, :_})
#PID<0.148.0>
iex> List.first([1, 2])
1
Function Elixir.List:first invoked
with arguments [[1, 2]] in process #PID<0.107.0>

Function Elixir.List:first/1
returned 1 in process #PID<0.107.0>

iex)> FunctionTracer.stop(pid)
true
```

{{ blog-nav.html }}
