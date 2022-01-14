use home;
use hyper::Client;
use notion_kindle;
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

    let mut clippings_json: Vec<Clipping> = vec![];

    for item in clippings_array {
        let clipping = Clipping {
            book: notion_kindle::get_book(item),
            author: notion_kindle::get_author(item),
            content: notion_kindle::get_content(item),
            kind: notion_kindle::get_kind(item),
            page: notion_kindle::get_page(item),
            location: notion_kindle::get_location(item),
            date: notion_kindle::get_date(item),
        };

        println!("clipping: {:#?}", clipping);
        clippings_json.push(clipping);
    }

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

#[tokio::main]
async fn upload() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let client = Client::new();

    // Parse an `http::Uri`...
    let uri = "http://httpbin.org/ip".parse()?;

    // Await the response...
    let mut resp = client.get(uri).await?;

    println!("Response: {}", resp.status());
    Ok(())
}
