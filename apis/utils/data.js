// languages
import { javascript } from "@codemirror/lang-javascript"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { python } from "@codemirror/lang-python"
import { rust } from "@codemirror/lang-rust"
import { php } from "@codemirror/lang-php"
// themes
import { okaidia } from "@uiw/codemirror-theme-okaidia"
import { dracula } from "@uiw/codemirror-theme-dracula"
import { solarizedLight } from "@uiw/codemirror-theme-solarized"
import { githubLight } from "@uiw/codemirror-theme-github"
import { material } from "@uiw/codemirror-theme-material"
import { monokai } from "@uiw/codemirror-theme-monokai"
import { nord } from "@uiw/codemirror-theme-nord"
import { darcula } from "@uiw/codemirror-theme-darcula"
import { eclipse } from "@uiw/codemirror-theme-eclipse"

// Boilerplate code for each language
export const boilerplateCode = {
  javascript: `// JavaScript Boilerplate
function main() {
  console.log("Hello, World!");
  
  // Your code here
  
  return 0;
}

main();`,
  cpp: `// C++ Boilerplate
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
  cout << "Hello, World!" << endl;
  
  // Your code here
  
  return 0;
}`,
  java: `// Java Boilerplate
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
    
    // Your code here
  }
}`,
  python: `# Python Boilerplate
def main():
    print("Hello, World!")
    
    # Your code here
    
    return 0

if __name__ == "__main__":
    main()`,
  rust: `// Rust Boilerplate
fn main() {
    println!("Hello, World!");
    
    // Your code here
}`,
  php: `<?php
// PHP Boilerplate
function main() {
    echo "Hello, World!";
    
    // Your code here
    
    return 0;
}

main();
?>`,
}



export const themes = {
    okaidia: { theme: okaidia, mode: "dark" },
    dracula: { theme: dracula, mode: "dark" },
    material: { theme: material, mode: "dark" },
    monokai: { theme: monokai, mode: "dark" },
    nord: { theme: nord, mode: "dark" },
    darcula: { theme: darcula, mode: "dark" },
    githubLight: { theme: githubLight, mode: "light" },
    solarizedLight: { theme: solarizedLight, mode: "light" },
    eclipse: { theme: eclipse, mode: "light" },
  }
  
export  const languages = {
    javascript: javascript,
    cpp: cpp,
    java: java,
    python: python,
    rust: rust,
    php: php,
  }
  
  
  