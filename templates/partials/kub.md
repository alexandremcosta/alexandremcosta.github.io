# Kubernetes Logs and Console Simplified Command

When working on a Kubernetes application, I constantly have to `kubectl get pod` then I copy the pod name and run something like:

```shell
$ kubectl logs -f pod_name
```

To automate this, we can use `$()` which evaluates a command and concatenates the result onto current command.  
First we need to adapt `kubectl get pod` to get the pod we want:

```shell
$ kubectl get pod -l "app=pod_name" -o name | sed "s/pod\///" | head -n 1
```

Change `pod_name` for your desired pod.  
Then we can use this inside `$()` to concatenate the log command:

```shell
$ kubectl logs -f $(kubectl get pod -l "app=pod_name" -o name | sed "s/pod\///" | head -n 1)
```

Finally, we can create a function. Think about this shell function as an alias with a param:

```
klog() {
 if [ "$#" -eq  "0" ]
   then
     kubectl logs -f $(kubectl get pod -l "app=default_pod_name" -o name | sed "s/pod\///" | head -n 1)
 else
     kubectl logs -f $(kubectl get pod -l "app=$1" -o name | sed "s/pod\///" | head -n 1)
 fi
}
```

Place it on your bash initialization script (usually `.bash_profile` or `.bashrc`) and change `default_pod_name` accordingly.  
Now you can access your default pod logs with `klog` and specific pods with `klog pod_name`.  
And it's trivial to adapt to run a remote console, or anything else.  

<br />
Have fun!
