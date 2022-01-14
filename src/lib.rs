use chrono::prelude::NaiveDateTime;
use chrono::Timelike;
use regex::Regex;

pub fn get_book(text: &str) -> String {
    let lines: Vec<&str> = text.lines().collect();
    String::from(lines[0].split(" (").next().unwrap_or(""))
}

pub fn get_author(text: &str) -> String {
    let lines: Vec<&str> = text.lines().collect();
    let result = Regex::new(r"\(([^()]*)\)")
        .unwrap()
        .find(lines[0])
        .map(|x| x.as_str())
        .unwrap_or("")
        .replace(&['(', ')'][..], "");
    String::from(result)
}

pub fn get_content(text: &str) -> String {
    let lines: Vec<&str> = text.lines().collect();
    String::from(if lines.len() < 4 { "" } else { lines[3] })
}

pub fn get_page(text: &str) -> String {
    let lines: Vec<&str> = text.lines().collect();
    let result = Regex::new(r"page\s\S*")
        .unwrap()
        .find(lines[1])
        .map(|x| x.as_str());
    let result = match result {
        Some(text) => &text[5..],
        None => "",
    };
    String::from(result)
}

pub fn get_location(text: &str) -> String {
    let lines: Vec<&str> = text.lines().collect();
    let result = Regex::new(r"Location\s\S*")
        .unwrap()
        .find(lines[1])
        .map(|x| x.as_str());
    let result = match result {
        Some(text) => &text[9..],
        None => "",
    };
    String::from(result)
}

pub fn get_kind(text: &str) -> String {
    let lines: Vec<&str> = text.lines().collect();
    let result = Regex::new(r"Your\s\S*")
        .unwrap()
        .find(lines[1])
        .map(|x| x.as_str());
    let result = match result {
        Some(text) => &text[5..],
        None => "",
    };
    String::from(result)
}

pub fn get_date(text: &str) -> String {
    let lines: Vec<&str> = text.lines().collect();
    let result = Regex::new(r"Added on.*")
        .unwrap()
        .find(lines[1])
        .map(|x| x.as_str());
    let result = match result {
        Some(text) => {
            let kindle_date = &text[9..];
            println!("kindle date shorten: {}", kindle_date);
            let notion_date =
                NaiveDateTime::parse_from_str(kindle_date, "%A, %B %e, %Y %I:%M:%S %p");
            let notion_date = match notion_date {
                Ok(date) => date,
                Err(message) => panic!("Parse date error: {}", message),
            };
            notion_date.to_string()
        }
        None => String::from(""),
    };

    result
}
