use home;
use regex::Regex;
use std::error::Error;
use std::fs;
use std::io::ErrorKind;
use std::path::PathBuf;
use std::process;

fn main() {
    if let Err(e) = run() {
        println!("Application error: {}", e);
        process::exit(1);
    };
}

fn run() -> Result<(), Box<dyn Error>> {
    let _real_clippings_path = "Kindle/documents/My Clippings.txt";
    let mut clippings_path = PathBuf::new();
    clippings_path.push(home::home_dir().unwrap());
    clippings_path.push("Documents/My Clippings short.txt");

    let clippings_string = fs::read_to_string(clippings_path).unwrap_or_else(|error| {
        if error.kind() == ErrorKind::NotFound {
            eprintln!("Clippings file not found.");
            process::exit(1);
        } else {
            panic!("Error while opening file: {:?}", error)
        }
    });

    let mut clippings_array: Vec<&str> = clippings_string.split("\r\n==========\r\n").collect();
    clippings_array.pop();

    println!("array0: {}", clippings_array[1]);
    println!("lenght: {}", clippings_array.len());

    let mut clippings_json: Vec<Clipping> = vec![];

    for item in clippings_array {
        let lines: Vec<&str> = item.lines().collect();
        println!("lines: {:?}", lines[0]);

        clippings_json.push(Clipping {
            book: String::from(lines[0].split(" (").next().unwrap_or("")),
            author: String::from(
                Regex::new(r"\(([^()]*)\)")
                    .unwrap()
                    .find(lines[0])
                    .map(|x| x.as_str())
                    .unwrap_or("")
                    .replace(&['(', ')'][..], ""),
            ),
            content: String::from(lines[3]),
            kind: String::new(),
            page: String::new(),
            location: String::new(),
            date: String::new(),
            // kind: String::from(
            //     Regex::new(r"(?<=Your\s)(\w+)")
            //         .unwrap()
            //         .find(lines[1])
            //         .map(|x| x.as_str())
            //         .unwrap_or(""),
            // ),
            // page: String::from(
            //     Regex::new(r"(?<=page\s)(\S+)")
            //         .unwrap()
            //         .find(lines[1])
            //         .map(|x| x.as_str())
            //         .unwrap_or(""),
            // ),
            // location: String::from(
            //     Regex::new(r"(?<=Location\s)(\S+)")
            //         .unwrap()
            //         .find(lines[1])
            //         .map(|x| x.as_str())
            //         .unwrap_or(""),
            // ),
            // date: String::from(
            //     Regex::new(r"(?<=Added on\s).*")
            //         .unwrap()
            //         .find(lines[1])
            //         .map(|x| x.as_str())
            //         .unwrap_or(""),
            // ),
            // kind: lines[1].match(/(?<=Your\s)(\w+)/)[0],
            // page: lines[1].match(/(?<=page\s)(\S+)/) ? lines[1].match(/(?<=page\s)(\w+)/)[0] : "",
            // location: lines[1].match(/(?<=Location\s)(\S+)/)[0],
            // date: dateParser(lines[1].match(/(?<=Added on\s).*/)[0]),
        })
    }

    println!("json: {:#?}", clippings_json);

    Ok(())
}
#[derive(Debug)]
struct Clipping {
    book: String,
    author: String,
    content: String,
    kind: String,
    page: String,
    location: String,
    date: String,
}
